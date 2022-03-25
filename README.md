# ft_transcendence

## Preview 
<div align="center">     
        <img align="center" src='https://user-images.githubusercontent.com/43440614/160107506-8e17a96e-64dc-400b-8125-dfe68b05ab91.gif' /> 
</div>
<br/>
<br/>

## Game 
<div align="center">
        <img align="center" src='https://user-images.githubusercontent.com/43440614/160108511-72b41139-48a5-4869-a54c-63bd21c9aeea.gif' width="486" />     
        <img align="center" src='https://user-images.githubusercontent.com/43440614/160108958-acad1404-a965-4954-ac56-7fde05ade3ae.gif' width="486" /> 
</div>

## Param 
<div align="center">
<img align="left" src='https://user-images.githubusercontent.com/43440614/160109659-58beea7d-f507-4598-a504-08a103ed1ad0.gif' width="486" />       
<img align="right" src='https://user-images.githubusercontent.com/43440614/160111345-aa688acc-9028-498f-b824-cd6a0a0b0e0a.gif' width="486" />
</div>
<br/>
<br/>

## Introduction 🤔
Website for the mighty pong contest. Your website will help users organize pong tournaments and play against each other, with a chat system, leaderboard, add friends, double authentication.

<div align="center">
        <img   src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
   <img   src="https://img.shields.io/badge/react%20-%2300D9FF.svg?&amp;style=for-the-badge&amp;logo=react&amp;logoColor=white" />
  <img   src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" />
  <img   src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img  src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white" />
 <img  src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white" />
 <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" />
        
        
        
</div>


## Installation & Usage ❕

1. Download/Clone this repo

        git clone https://github.com/kazuumaVII/ft_transcendence.git
2. Open and run Docker

3. `cd` into the root directory and run `make`

        cd ft_transcendence
        make


## Mandatory  🌐

User Account
- A user must login using the oauth system of 42 intranet
- A user must be able to choose a unique name that will be displayed on the website
- A user has a number of victory and loss and other stats (ladder level, number of won tournaments, achievements etc...)
- A user must have an avatar generated or uploaded by the user
- A user must be able to activate a 2 factor authentication (like google authenticator or a sms etc...)
- A user can be in 1 guild at a time
- A user can add other users as friends, and see their current status (online, offline, in a game...)
- Each user has a match history (including duel, ladder or tournaments games) that can be consulted by anyone logged-in

Chat
- Users must be able to create channels public/private or protected by a password
- Users must be able to send direct messages to other user
- Users must be able to block other user and therefore they will not see their messages anymore
- A user that create a new channel is automatically its owner until he leaves the channel
    ◦ owner of a channel can add/change/remove a password to access to the channel
    ◦ owner can select user to be administrator and is also administrator of the channel
    ∗ administrator can ban or mute users for a certain amount of time

- Through the chat interface users should be able to ask other player to do a Pong match
- Through the chat interface users must be able to see other players profiles

Game
- The main purpose of this website is to play pong against other players and show everyone how good you are!
- Therefor we should be able to play pong directly on the website and live against an other player.
- It can be in a canvas or it can be with 3d effects, it can be ugly but it must be a pong like the one from 1972.
- If you want to, you can add power ups, different maps etc... but user must be able to play a default pong game without any added stuff.
- The game must be responsive!
- Other users can watch the game live without interfering in it.



