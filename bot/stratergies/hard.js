// strategies/hard.js
const hardStrategy = {
    makeMove: (gameState) => {
      const { previousMoves, possibleMoves, opponentBluffPatterns } = gameState;
  
      // Identify bluff patterns and counter them
      const counterMove = opponentBluffPatterns.find((pattern) =>
        possibleMoves.includes(pattern.counterMove)
      );
  
      if (counterMove) {
        return counterMove.counterMove;
      }
  
      // If no counter-move is found, use the safest option
      return possibleMoves[0];
    },
  };
  
  export default hardStrategy;
  