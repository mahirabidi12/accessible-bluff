// strategies/medium.js
const mediumStrategy = {
    makeMove: (gameState) => {
      const { previousMoves, possibleMoves } = gameState;
  
      // Analyze the most frequent moves and bluff patterns
      const mostCommonMove = previousMoves.length 
        ? previousMoves.reduce((acc, move) => {
            acc[move] = (acc[move] || 0) + 1;
            return acc;
          }, {})
        : {};
  
      const bestMove = Object.keys(mostCommonMove).reduce((a, b) => 
        mostCommonMove[a] > mostCommonMove[b] ? a : b, null
      );
  
      return possibleMoves.includes(bestMove) ? bestMove : possibleMoves[0];
    },
  };
  
  export default mediumStrategy;
  