import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { Transform, Type, Exclude, Expose } from 'class-transformer';

export class RegularPlayerDto {
  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty()
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}

@Exclude()
export class HistoryGameDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  /*
  // TODO change to int for front ?
  @Transform((value) => {
    return parseInt(value.obj.createdAt as unknown as string);
  })
  */
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @Transform((value) => {
    // TODO change to int for computation and return number
    return value.obj.updatedAt - value.obj.createdAt;
  })
  duration: number;

  @ApiProperty()
  @Expose()
  @Type(() => RegularPlayerDto)
  players: RegularPlayerDto[];
}
