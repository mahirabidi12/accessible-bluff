import easyStrategy from './strategies/easy.js';
import mediumStrategy from './strategies/medium.js';
import hardStrategy from './strategies/hard.js';
import { getPersonality } from './personalities.js';

const strategies = { easy: easyStrategy, medium: mediumStrategy, hard: hardStrategy };

class AIBot {
  constructor(difficulty = 'medium', personalityType = 'balanced') {
    this.difficulty = difficulty;
    this.strategy = strategies[difficulty] || strategies.medium;
    this.personality = getPersonality(personalityType);
    this.memory = { previousMoves: [], bluffHistory: {} };
  }

  analyzeGameState(gameState) {
    const lastMove = gameState.previousMoves[gameState.previousMoves.length - 1];
    if (!this.memory.bluffHistory[lastMove]) this.memory.bluffHistory[lastMove] = 0;
    this.memory.bluffHistory[lastMove] += 1;
  }

  makeMove(gameState) {
    this.analyzeGameState(gameState);
    return this.strategy.makeMove(gameState, this.personality, this.memory);
  }

  challengeBluff(gameState) {
    return this.personality.challengeBluff(gameState, this.memory);
  }
}

export default AIBot;
