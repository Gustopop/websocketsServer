const WebSocket = require('ws');

const server = new WebSocket.Server({
  port: 8080
});

let players = [];
let nextPlayerId = 1;
let usedIds = new Set();
let currentQuestionIndex = 0;

const chatMsg = 'Test123';

server.on('connection', (socket) => {
  console.log('A player has joined the game!');

  let playerId = nextPlayerId;
  while (usedIds.has(playerId) && playerId < 2) {
    playerId = ++nextPlayerId;
  }
  usedIds.add(playerId);

  players.push({ id: playerId, socket });

  socket.on('message', (message) => {
    console.log(`Received message from player ${playerId}: ${message}`);

    const receivedMessage = JSON.parse(message);
    //Pentru mine: type = answer message chat
    //La receive: message
    if (receivedMessage.type === 'chat'){
      console.log('Am primit mesajul: ' + receivedMessage.message)
    }


    if (receivedMessage.type === 'chat'){
      const someID = playerId;
      players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(JSON.stringify({type: 'chat', playerID: someID, chatMsg: receivedMessage.message}));
        }
      });
      console.log("Am trimis mesajul: " + receivedMessage.message);
    }

    if (receivedMessage.type === 'nameChange'){
      console.log("Am primit username change: "+ receivedMessage.message);
      const someName = receivedMessage.message;
      const prevId = playerId;
      players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(JSON.stringify({type: 'nameChange', playerID: someName, prevID: prevId}));
          console.log("Am trimis numele : " + someName);
        }
      });
      playerId = someName;
    }

    if (receivedMessage.type === 'itemChange'){
      console.log("Am primit item change: "+ receivedMessage.clickedItems + " de la playerul: " + receivedMessage.playerID + " cu indexul : " + receivedMessage.index);
      const someID = receivedMessage.playerID;
      const clickedItem = receivedMessage.clickedItems;
      const index = receivedMessage.index;
      players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(JSON.stringify({type: 'itemChange', playerID: someID, clickedItems: clickedItem, index: index}));
          console.log("Am trimis itemul: " + clickedItem + " de la playerul: " + someID);
        }
      });
    }

    if (receivedMessage.type === 'itemOccupied'){
      const someID = receivedMessage.playerID;
      const clickedItem = receivedMessage.clickedItems;
      const index = receivedMessage.index;
      players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(JSON.stringify({type: 'itemOccupied', playerID: someID, clickedItems: clickedItem, index: index}));
          console.log("Am trimis itemul ocupat: " + clickedItem + " de la playerul: " + someID + " cu indexul: " + index);
        }
      });
    }


  });


  socket.on('close', () => {
    console.log(`Player ${playerId} has left the game.`);
    players = players.filter((player) => player.id !== playerId);
    usedIds.delete(playerId);

    if (nextPlayerId > 1 && nextPlayerId < 3) nextPlayerId--;

    startGame();

  });

  if (players.length === 2) {
    startGame();
    //TODO : poate adaug ceva aici
  }
});

function startGame() {
//TODO: poate adaug ceva aici
  players.forEach((player) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({type : 'setID', playerID: player.id}));
    }
  });
}

function endGame(){
  broadcast("quizOver");
}

function broadcast(message) {
  players.forEach((player) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({question: message, questNr: questNr, chatMsg: chatMsg, playerID: player.id}));
      player.socket.send(JSON.stringify({type : 'setID', playerID: player.id}));
    }
  });
}