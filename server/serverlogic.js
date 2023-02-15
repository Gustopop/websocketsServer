const WebSocket = require('ws');

const server = new WebSocket.Server({
  port: 8080
});

let players = [];
let nextPlayerId = 1;
let usedIds = new Set();
let currentQuestionIndex = 0;

let questNr = 0;

const chatMsg = 'Test123';

const questions = [
  { question: 'What is the capital of France?', answer: 'Paris' },
  { question: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
  { question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci' }
];

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

    if (receivedMessage.type === 'answer'){
      if (questions[currentQuestionIndex].answer == receivedMessage.message) {
        console.log("Muie corect");
      }
      else {
        console.log("muie incorect");
      }
    }

    if (receivedMessage.type === 'answer'){
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        questNr++;
        broadcast(questions[currentQuestionIndex].question, questNr);
      }
      else {
        endGame();
      }
    }

    if (receivedMessage.message == "reloadquiz"){
      currentQuestionIndex = 0;
      questNr = 0;
      startGame();
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

  });


  socket.on('close', () => {
    console.log(`Player ${playerId} has left the game.`);
    players = players.filter((player) => player.id !== playerId);
    usedIds.delete(playerId);

    if (nextPlayerId > 1 && nextPlayerId < 3) nextPlayerId--;

    currentQuestionIndex = 0;
    questNr = 0;
    startGame();

  });

  if (players.length === 2) {
    startGame();
  }
});

function startGame() {
  currentQuestionIndex = 0;
  questNr = 0;
  broadcast(questions[currentQuestionIndex].question);
}

function endGame(){
  broadcast("quizOver");
}

function broadcast(message) {
  players.forEach((player) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({question: message, questNr: questNr, chatMsg: chatMsg, playerID: player.id}));
    }
  });
}