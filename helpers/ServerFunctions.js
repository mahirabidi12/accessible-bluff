export const partitionCards = (cardset, roomCapacity) => {
  const totalCards = cardset.length;
  const cardsPerPlayer = Math.floor(totalCards / roomCapacity);
  const partitionedCards = [];

  for (let i = 0; i < roomCapacity; i++) {
    const start = i * cardsPerPlayer;
    const end = (i + 1) * cardsPerPlayer;
    partitionedCards.push(cardset.slice(start, end));
  }

  return partitionedCards;
};

export const delayedCode = (cardset, roomCapacity, connectedClients) => {
  const partitionedCards = partitionCards(cardset, roomCapacity);

  connectedClients.forEach((client, index) => {
    const subpartition = partitionedCards[index];
    client.emit('STOC-DRAW-CARDS', subpartition);
  });
};