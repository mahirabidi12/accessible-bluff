import AIBot from '../aiBot/aiBot.js'; // Adjust the path based on your structure

const bot = new AIBot('medium'); // Choose difficulty: 'easy', 'medium', or 'hard'

const gameState = {
  previousMoves: ['queen', 'jack', 'king'],
  possibleMoves: ['queen', 'ace', 'king'],
  opponentBluffPatterns: [
    { pattern: 'queen', counterMove: 'ace' },
    { pattern: 'king', counterMove: 'jack' }
  ],
};

const move = bot.makeMove(gameState);
console.log('AI Move:', move);
