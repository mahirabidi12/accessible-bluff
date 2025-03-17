// strategies/easy.js
const easyStrategy = {
    makeMove: (gameState) => {
      const randomMove = gameState.possibleMoves[Math.floor(Math.random() * gameState.possibleMoves.length)];
      return randomMove || 'pass';
    },
  };
  
  export default easyStrategy;
  