const WebSocket = require('ws');

const server = new WebSocket.Server({
  port: 8080
});

let players = [];
let nextPlayerId = 1;
let usedIds = new Set();
let currentQuestionIndex = 0;

let questNr = 0;

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

    if (questions[currentQuestionIndex].answer == message) {
      console.log("Muie corect");
    }
    else {
      console.log("muie incorect");
    }


    if (message != "reloadquiz"){
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        questNr++;
        broadcast(questions[currentQuestionIndex].question, questNr);
      }
      else {
        //currentQuestionIndex = 0;
        //startGame();
        endGame();
      }
    }



    if (message == "reloadquiz"){
      currentQuestionIndex = 0;
      questNr = 0;
      startGame();
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
      player.socket.send(JSON.stringify({ question: message, questNr: questNr }));
    }
  });
}