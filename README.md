# ft_transcendence

# Introduction 🤔
Website for the mighty pong contest. Your website will help users organize pong tournaments and play against each other, with a chat system, leaderboard, add friends, double authentication.

## User Account
- A user must login using the oauth system of 42 intranet
- A user must be able to choose a unique name that will be displayed on the website
- A user has a number of victory and loss and other stats (ladder level, number of won tournaments, achievements etc...)
- A user must have an avatar generated or uploaded by the user
- A user must be able to activate a 2 factor authentication (like google authenticator or a sms etc...)
- A user can be in 1 guild at a time
- A user can add other users as friends, and see their current status (online, offline, in a game...)
- Each user has a match history (including duel, ladder or tournaments games) that can be consulted by anyone logged-in

## Chat
- Users must be able to create channels public/private or protected by a password
- Users must be able to send direct messages to other user
- Users must be able to block other user and therefore they will not see their messages anymore
- A user that create a new channel is automatically its owner until he leaves the channel
    ◦ owner of a channel can add/change/remove a password to access to the channel
    ◦ owner can select user to be administrator and is also administrator of the channel
    ∗ administrator can ban or mute users for a certain amount of time

- Through the chat interface users should be able to ask other player to do a Pong match
- Through the chat interface users must be able to see other players profiles

## Game
The main purpose of this website is to play pong against other players and show everyone how good you are!
Therefor we should be able to play pong directly on the website and live against an other player.
It can be in a canvas or it can be with 3d effects, it can be ugly but it must be a pong like the one from 1972.
If you want to, you can add power ups, different maps etc... but user must be able to play a default pong game without any added stuff.
The game must be responsive!
Other users can watch the game live without interfering in it.







## Back end:

### FIRST:
docker-compose build


### Run dev mode for backend/frontend/both:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up [--build] [back_end_server|front_end_server]

### Run dev mode with debugger for backend/frontend/both:
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up [--build] [back_end_server|front_end_server]

### Run end-to-end test mode for backend:
docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2ewatch'


### Run production mode:
docker-compose up [--build]

### Documentation for the backend routes:
http://localhost:3000/api/

## Tests

### Test specific unit test

For auth.controller:

`docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'jest --watchAll --maxWorkers=1 --testPathPattern=auth.controller'`

With:
`--testPathPattern=[regex]`

### DEBUG conf to attach vscode to docker container:
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "pwa-node",
      "request": "attach",
      "restart": true,
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/back_end",
      "remoteRoot": "/usr/src/app",
      "protocol": "inspector"
    }
  ]
}
```
