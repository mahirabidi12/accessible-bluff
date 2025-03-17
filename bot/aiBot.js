import { easyStrategy } from './strategies/easy.js';
import { mediumStrategy } from './strategies/medium.js';
import { hardStrategy } from './strategies/hard.js';

class AIBot {
  constructor(difficulty = 'medium') {
    this.setDifficulty(difficulty);
  }

  setDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy':
        this.strategy = easyStrategy;
        break;
      case 'medium':
        this.strategy = mediumStrategy;
        break;
      case 'hard':
        this.strategy = hardStrategy;
        break;
      default:
        throw new Error('Invalid difficulty level');
    }
  }

  makeMove(gameState) {
    return this.strategy(gameState);
  }
}

export default AIBot;
