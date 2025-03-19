const hardStrategy = {
  makeMove: (gameState, personality, memory) => {
    if (Math.random() < personality.bluffFrequency) {
      return gameState.possibleMoves[Math.floor(Math.random() * gameState.possibleMoves.length)];
    }
    const mostCommonMove = Object.entries(memory.bluffHistory).sort((a, b) => b[1] - a[1])[0];
    return mostCommonMove ? mostCommonMove[0] : gameState.previousMoves[0] || gameState.possibleMoves[0];
  },
};

export default hardStrategy;
