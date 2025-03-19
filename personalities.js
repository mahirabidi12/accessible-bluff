export function getPersonality(type) {
    const personalities = {
      aggressive: {
        bluffFrequency: 0.7,
        challengeBluff: (gameState, memory) => Math.random() < 0.6,
      },
      cautious: {
        bluffFrequency: 0.3,
        challengeBluff: (gameState, memory) => Math.random() < 0.8,
      },
      balanced: {
        bluffFrequency: 0.5,
        challengeBluff: (gameState, memory) => Math.random() < 0.5,
      },
    };
    return personalities[type] || personalities.balanced;
  }
  