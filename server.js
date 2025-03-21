var express = require("express");
var app = express()
var http = require("http").createServer(app)
var io = require("socket.io")(http)
var serverfn = require('./helpers/ServerFunctions')
var path = require('path');
const hbs = require('hbs');
// Set up the view engine to use HBS
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
var Deck = require('./helpers/deck');
const { v4: uuidv4 } = require('uuid');
const rooms = {};
const roomCapacity = 2; // Room capacity
const roomCounts = {};

app.get('/', (req, res) => {
  res.render('game');
});

const CardDeck = new Deck.Deck();
io.on('connection', (socket) => {
  console.log("New connection established:", socket.id);
  
  let roomId;
  for (const [room, count] of Object.entries(roomCounts)) {
    if (count < roomCapacity) {
      roomId = room;
      break;
    }
  }

  if (!roomId) {
    roomId = uuidv4();
    CardDeck.shuffle();
    roomCounts[roomId] = 0;
    rooms[roomId] = {
      clients: [],
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
      moveHistory: [], // New: Track moves for AI-based hints
    };
  }

  socket.join(roomId);
  rooms[roomId].clients.push(socket);
  roomCounts[roomId]++;

  console.log(`User joined Room: ${roomId}, Members: ${roomCounts[roomId]}`);

  if (roomCounts[roomId] >= roomCapacity) {
    io.to(roomId).emit('STOC-SET-NUMBER-OF-PLAYERS', roomCapacity);
    assignTurns(roomId);
    setTimeout(() => serverfn.delayedCode(rooms[roomId].cardset, roomCapacity, rooms[roomId].clients), 4000);
    setTimeout(() => changeTurn(roomId, io), 5000);
  }

  socket.on('CTOS-PLACE-CARD', (selectedCards, bluff_text, remainingCards) => {
    lastPlayedCardCount = selectedCards.length;
    rooms[roomId].playinguserfail = false;
    
    selectedCards.forEach((card) => {
      rooms[roomId].SuitStack.push(card.suit);
      rooms[roomId].CardStack.push(card.value);
    });

    if (remainingCards == 0) {
      rooms[roomId].playerGoingToWin = rooms[roomId].currentTurnIndex;
    }

    rooms[roomId].raiseActionDone = false;
    if (rooms[roomId].newGame === true) {
      rooms[roomId].newGame = false;
      rooms[roomId].bluff_text = bluff_text;
    }

    // New: Store move history
    rooms[roomId].moveHistory.push({
      player: socket.id,
      playedCards: selectedCards.map(c => c.value),
      bluffText: bluff_text,
      timestamp: Date.now()
    });

    io.to(roomId).emit('STOC-GAME-PLAYED', lastPlayedCardCount, rooms[roomId].bluff_text);
    io.to(roomId).emit('STOC-RAISE-TIME-START');

    setTimeout(() => {
      if (rooms[roomId].playerGoingToWin != -1) {
        rooms[roomId].wonUsers.push(rooms[roomId].playerGoingToWin);
        io.to(roomId).emit('STOC-PLAYER-WON', rooms[roomId].playerGoingToWin);
        rooms[roomId].playerGoingToWin = -1;
      }
      if (!rooms[roomId].raiseActionDone) {
        io.to(roomId).emit('STOC-RAISE-TIME-OVER');
        changeTurn(roomId, io);
      }
    }, 15000);

    // New: Generate AI-powered hint
    setTimeout(() => {
      generateAIHint(roomId, socket.id);
    }, 3000);
  });

  function generateAIHint(roomId, playerId) {
    const room = rooms[roomId];
    if (!room) return;

    const lastMoves = room.moveHistory.slice(-5); // Analyze last 5 moves
    const bluffCounts = lastMoves.filter(move => move.bluffText !== move.playedCards[0]).length;
    const bluffProbability = bluffCounts / lastMoves.length;

    let hintMessage;
    if (bluffProbability > 0.6) {
      hintMessage = "High chance of bluffing! Consider raising!";
    } else if (bluffProbability < 0.3) {
      hintMessage = "Opponent is likely playing honestly.";
    } else {
      hintMessage = "Mixed strategies detected. Play cautiously.";
    }

    io.to(playerId).emit('STOC-AI-HINT', hintMessage);
  }

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
    roomCounts[roomId]--;
    if (roomCounts[roomId] <= 0) {
      delete roomCounts[roomId];
    }
  });
});

function assignTurns(roomId) {
  rooms[roomId].clients.forEach((client, index) => {
    client.emit('STO1C-SET-POSITION', index);
  });
}

function changeTurn(roomId) {
  rooms[roomId].currentTurnIndex = (rooms[roomId].currentTurnIndex + 1) % rooms[roomId].clients.length;

  if (rooms[roomId].wonUsers.length === rooms[roomId].clients.length - 1) {
    io.to(roomId).emit('STOC-GAME-OVER', rooms[roomId].wonUsers);
  } else {
    io.to(roomId).emit('STOC-SET-WHOS-TURN', rooms[roomId].currentTurnIndex, rooms[roomId].newGame);
  }
}

http.listen(3000, () => {
  console.log("Server running on port 3000");
});
