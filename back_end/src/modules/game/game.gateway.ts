import { Server, Socket } from 'socket.io';
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { User } from '../users/entities/users.entity';
import { WsGameService } from './services/ws-game.service';
import { Logger, UseFilters } from '@nestjs/common';
import { WsConnectionService } from './services/ws-connection.service';
import { WsErrorFilter } from './filters/ws-error.filter';
import { randomUUID } from 'crypto';
import { GameService } from './services/game.service';
import { myPtoOnlineGameDto, myPtoUserDto } from './utils/utils';
import {
  BallPosDto,
  BroadcastDto,
  GamePlayerDto,
  PowerUpDto,
  ScoreDto,
} from './dto/gameplay.dto';

const options_game: GatewayMetadata = {
  namespace: 'game',
  cors: {
    origin: [
      `http://${process.env.SERVER_IP}`,
      `http://${process.env.SERVER_IP}:${process.env.FRONT_PORT}`,
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

// @UseFilters(WsErrorFilter)
@WebSocketGateway(options_game)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly wsGameService: WsGameService,
    private readonly wsConnectionService: WsConnectionService,
  ) {}

  private readonly logger = new Logger('GameGateway');

  //------------------------- LIFECYCLE EVENTS -------------------------------//

  afterInit() {
    this.logger.debug('ws game 🎲  afterInit');
  }

  async handleConnection(client: Socket) {
    this.logger.debug('ws game 🎲  connect -> ', client.id);
    await this.wsConnectionService.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug('ws game 🎲  disconnected -> ', client.id);
    await this.wsConnectionService.doHandleDisconnect(client);
  }

  //---------------------- GAME SUBSCRIPTION EVENTS --------------------------//

  async joinGame(game_id: string, joining: boolean) {
    this.logger.log('joinGame');
    if (!joining) return null;

    const game = await this.gameService.findOne(game_id, {
      relations: ['players', 'players.user'],
    });
    const ws_ids = [game.players[0].user.game_ws, game.players[1].user.game_ws];
    this.server
      .to(ws_ids[0])
      .emit('newPlayerJoined', myPtoUserDto(game.players[1].user));
    this.wsGameService.startGame(ws_ids, game.id, this.server);
    return myPtoUserDto(game.players[0].user);
  }

  async gameInvitation(challenger: User, opponent: User) {
    this.server
      .to(opponent.game_ws)
      .emit('gameInvitation', myPtoUserDto(challenger), challenger.game_ws);
  }

  @UseFilters(WsErrorFilter)
  @SubscribeMessage('gameInvitResponse')
  async gameInvitResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() reply: { response: string; to: string },
  ) {
    this.logger.log('gameInvitResponse: ', reply);
    const [challenger, opponent] = await this.wsGameService.getUserFromParam([
      { game_ws: reply.to },
      { game_ws: client.id },
    ]);

    if (!opponent || !challenger) {
      this.wsGameService.cancelPanicGame([challenger, opponent]);
      throw new WsException('Wow shit');
    }

    if (reply.response === 'OK') {
      this.logger.log(`gameInvitation accepted: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(opponent, { is_in_game: true });
      this.server.to(reply.to).emit('gameAccepted', myPtoUserDto(opponent));
      this.wsGameService
        .createGame([challenger, opponent], [reply.to, client.id], this.server)
        .catch((e) => {
          this.logger.log(`--- ERROR --- ${e.error}`);
          this.wsGameService.cancelPanicGame([challenger, opponent]);
          client.emit('myerror', e.error);
        });
    } else {
      this.logger.log(`gameInvitation denied: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(challenger, {
        is_in_game: false,
      });
      this.server.to(reply.to).emit('gameDenied', myPtoUserDto(opponent));
    }
  }

  @SubscribeMessage('setMap')
  async setMap(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
    @MessageBody('map') map: string,
  ) {
    console.log('map:', map);
    await this.gameService.updateGame(room, {
      map: map,
      watch: randomUUID(),
    });

    client.to(room).emit('getMap', map);

    ///// TEST // TODO: delete test below
    console.log(`client id: ${client.id}`);
    console.log(
      'countdown finished, game: ',
      await this.gameService.findOne(room, null),
    );
  }

  //Implémentation à voir: est ce que c'est un event envoyé depuis un des joueurs
  //ou bien est-ce une methode a appeler differemment ? Genre qd l'update d'un
  //game atteint un score de 10 ?
  @SubscribeMessage('gameFinished')
  async gameFinished(@MessageBody() room: string) {
    this.server.of('game').except(room).emit('gameFinished', room);
    // const watch = this.wsGameService.getWatchId(room);
    // this.server.socketsLeave([room, watch]);//TODO uncomment
  }

  @SubscribeMessage('watchGame')
  async watchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    const [game] = await this.gameService.findGameWithAnyParam(
      [{ watch: room }],
      { relations: ['players', 'players.user', 'players.user.local_photo'] },
    );
    if (!game) return 'game not found';
    client.join(room);
    return myPtoOnlineGameDto(game);
  }

  @SubscribeMessage('leaveWatchGame')
  leaveWatchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
  }

  //------------------------- END GAME ---------------------------------------//

  @SubscribeMessage('endGame')
  async endGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('score') score: ScoreDto,
  ) {
    let ret = await this.gameService.updateGame(bcast.room, {
      watch: null,
      updatedAt: Date.now(),
    });
    if (!ret) return;
    ret = await this.gameService.findOne(ret.id, {
      relations: ['players', 'players.user'],
    });
    this.gameService.updatePlayers([
      { id: ret.players[0].id, patch: { score: score.score1 } },
      { id: ret.players[1].id, patch: { score: score.score2 } },
    ]);
    // mettre les scores dans la table + watch = null
    // faire leave tt le monde.
    // update le status des joueurs
  }

  //------------------------- GAMEPLAY EVENTS --------------------------------//

  @SubscribeMessage('scoreUpdate')
  scoreUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('score') score: ScoreDto,
  ) {
    client.to([bcast.room, bcast.watchers]).emit('scoreUpdate', score);
  }

  @SubscribeMessage('powerUpUpdate')
  powerUpUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('powerup') powerup: PowerUpDto,
  ) {
    client.to([bcast.room, bcast.watchers]).emit('powerUpUpdate', powerup);
  }

  @SubscribeMessage('ballPosUpdate')
  ballPosUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('ballpos') ballpos: BallPosDto,
  ) {
    client.to([bcast.room, bcast.watchers]).emit('ballPosUpdate', ballpos);
  }

  @SubscribeMessage('playerUpdate')
  playerUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('gamePlayer') gamePlayer: GamePlayerDto,
    @MessageBody('playerNb') playerNb: number,
  ) {
    client
      .to([bcast.room, bcast.watchers])
      .emit('playerUpdate', gamePlayer, playerNb);
  }
}
