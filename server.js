var express = require("express");
var app = express()
var http = require("http").createServer(app)
var io = require("socket.io")(http)
var serverfn = require('./helpers/ServerFunctions')
var path = require('path');
const hbs = require('hbs');
const BotPlayer = require('./BotPlayer');

app.set('view engine', 'hbs');

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
var Deck = require('./helpers/deck');
const { v4: uuidv4 } = require('uuid');
const rooms = {};
app.get('/', (req, res) => {
  res.render('game');
});
const roomCapacity = 2;
const roomCounts = {};
io.on('connection', (socket) => {
  console.log("New connection established. User connected with ID:", socket.id);
  let roomId;
  for (const [room, count] of Object.entries(roomCounts)) {
    if (count < roomCapacity) {
      roomId = room;
      break;
    }
  }
  if (!roomId) {
    roomId = uuidv4();
    const CardDeck = new Deck.Deck();
    CardDeck.shuffle();
    roomCounts[roomId] = 0;
    rooms[roomId] = {
      clients: [],
      bots: [],
      CardStack: [],
      SuitStack: [],
      passedPlayers: [],
      playerGoingToWin: -1,
      wonUsers: [],
      lastPlayedCardCount: undefined,
      currentTurnIndex: -1,
      playinguserfail: false,
      newGame: true,
      bluff_text: undefined,
      raiseActionDone: false,
      cardset: CardDeck.cards,
    };
  }
  socket.join(roomId);
  rooms[roomId].clients.push(socket);
  roomCounts[roomId]++;
  console.log("New user joined connected with room ID: " + roomId + ", member count: " + roomCounts[roomId]);
  if (roomCounts[roomId] >= roomCapacity) {
    io.to(roomId).emit('STOC-SET-NUMBER-OF-PLAYERS', roomCapacity);
    addBotToRoom(roomId, 'Bot1', 'easy');
    assignTurns(roomId);
    setTimeout(() => {
      serverfn.delayedCode(rooms[roomId].cardset, roomCapacity, rooms[roomId].clients);
    }, 4000);
    executeDuringDelay(roomId);
    setTimeout(() => {
      changeTurn(roomId, io);
    }, 5000);
  }
  function executeDuringDelay(roomId) {
    console.log(roomId);
    io.to(roomId).emit('STOC-SHUFFLING', 'shuffle')
  }
  socket.on('disconnect', () => {
    console.log("User disconnected with roomID:" + roomId + ' member ' + roomCounts[roomId]);
    roomCounts[roomId]--;
    if (roomCounts[roomId] <= 0) {
      delete roomCounts[roomId];
      console.log("Room ended");
    }
  });
});

function assignTurns(roomId) {
  rooms[roomId].clients.forEach((client, index) => {
    client.emit('STO1C-SET-POSITION', index);
  });
}

function changeTurn(roomId) {
  rooms[roomId].currentTurnIndex = (rooms[roomId].currentTurnIndex + 1) % (rooms[roomId].clients.length + rooms[roomId].bots.length);
  if (rooms[roomId].wonUsers.length === rooms[roomId].clients.length + rooms[roomId].bots.length - 1) {
    io.to(roomId).emit('STOC-GAME-OVER', rooms[roomId].wonUsers);
  } else {
    if (rooms[roomId].currentTurnIndex >= rooms[roomId].clients.length) {
      botTurn(roomId, rooms[roomId].currentTurnIndex - rooms[roomId].clients.length);
    } else {
      io.to(roomId).emit('STOC-SET-WHOS-TURN', rooms[roomId].currentTurnIndex, rooms[roomId].newGame);
    }
  }
}

function addBotToRoom(roomId, botName, difficulty) {
  const bot = new BotPlayer(botName, difficulty);
  rooms[roomId].bots.push(bot);
  bot.receiveCards(rooms[roomId].cardset.splice(0, 5));
}

function botTurn(roomId, botIndex) {
  setTimeout(() => {
    const bot = rooms[roomId].bots[botIndex];
    const move = bot.makeMove(rooms[roomId]);
    if (move.action === 'pass') {
      io.to(roomId).emit('STOC-GAME-PLAYED', 0, rooms[roomId].bluff_text);
      changeTurn(roomId);
    } else {
      rooms[roomId].lastPlayedCardCount = move.selectedCards.length;
      rooms[roomId].SuitStack.push(...move.selectedCards.map(c => c.suit));
      rooms[roomId].CardStack.push(...move.selectedCards.map(c => c.value));
      rooms[roomId].bluff_text = move.bluffText;
      io.to(roomId).emit('STOC-GAME-PLAYED', rooms[roomId].lastPlayedCardCount, rooms[roomId].bluff_text);
      io.to(roomId).emit('STOC-RAISE-TIME-START');
      setTimeout(() => {
        changeTurn(roomId);
      }, 5000);
    }
  }, 2000);
}

http.listen(3000, () => {
  console.log("connected to server");
});
