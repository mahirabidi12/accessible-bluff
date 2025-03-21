module.exports = {
  partitionCards: (cardset, roomCapacity) => {
    const totalCards = cardset.length;
    const cardsPerPlayer = Math.floor(totalCards / roomCapacity);
    console.log(cardsPerPlayer);
    const partitionedCards = [];

    for (let i = 0; i < roomCapacity; i++) {
      const start = i * cardsPerPlayer;
      const end = (i + 1) * cardsPerPlayer;
      partitionedCards.push(cardset.slice(start, end));
    }

    return partitionedCards;
  },

  delayedCode: (cardset, roomCapacity, connectedClients) => {
    const partitionedCards = module.exports.partitionCards(cardset, roomCapacity);

    connectedClients.forEach((client, index) => {
      const subpartition = partitionedCards[index];
      console.log(subpartition);
      client.emit('STO1C-DRAW-CARDS', subpartition);
    });

    // Introduce AI Hint Feature
    setTimeout(() => {
      module.exports.generateAIHints(connectedClients);
    }, 3000);
  },

  generateAIHints: (connectedClients) => {
    connectedClients.forEach((client, index) => {
      const bluffProbability = Math.floor(Math.random() * 100);
      let hintMessage = '';

      if (bluffProbability > 75) {
        hintMessage = 'High chance of bluff! Be cautious.';
      } else if (bluffProbability > 50) {
        hintMessage = 'Medium bluff risk detected.';
      } else {
        hintMessage = 'Low bluff risk, but stay sharp!';
      }

      console.log(`AI Hint for Player ${index + 1}: ${hintMessage}`);
      client.emit('STOC-AI-HINT', hintMessage);
    });
  },
};
