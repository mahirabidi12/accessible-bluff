const mediumStrategy = {
  makeMove: (gameState, personality, memory) => {
    if (Math.random() < personality.bluffFrequency) {
      return gameState.possibleMoves[Math.floor(Math.random() * gameState.possibleMoves.length)];
    }
    return gameState.previousMoves[gameState.previousMoves.length - 1] || gameState.possibleMoves[0];
  },
};

export default mediumStrategy;
