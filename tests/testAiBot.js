import AIBot from './aiBot/aiBot.js';

const bot = new AIBot('hard', 'aggressive');

const gameState = {
  previousMoves: ['queen', 'jack', 'king'],
  possibleMoves: ['queen', 'ace', 'king'],
};

console.log('AI Move:', bot.makeMove(gameState));
console.log('Challenge Bluff Decision:', bot.challengeBluff(gameState));
