module.exports.delayedCode = function (cardset, roomCapacity, clients) {
  console.log("Dealing cards...");
  let hands = [];
  let totalCards = cardset.length;
  let cardsPerPlayer = Math.floor(totalCards / roomCapacity);

  for (let i = 0; i < roomCapacity; i++) {
    hands.push(cardset.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer));
  }

  clients.forEach((client, index) => {
    client.emit("STOC-DEAL-CARDS", hands[index]);
  });
};

module.exports.generateAIHint = function (roomId, playerId, rooms, io) {
  const room = rooms[roomId];
  if (!room) return;

  if (!room.moveHistory) {
    room.moveHistory = [];
  }

  const lastMoves = room.moveHistory.slice(-5);
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
};
