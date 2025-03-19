const easyStrategy = {
  makeMove: (gameState, personality) => {
    if (Math.random() < personality.bluffFrequency) {
      return gameState.possibleMoves[Math.floor(Math.random() * gameState.possibleMoves.length)];
    }
    return gameState.previousMoves[0] || gameState.possibleMoves[0];
  },
};

export default easyStrategy;
