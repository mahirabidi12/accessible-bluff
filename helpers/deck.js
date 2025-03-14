
const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards;
  }

  get numberOfCards() {
    return this.cards.length;
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1));
      [this.cards[newIndex], this.cards[i]] = [this.cards[i], this.cards[newIndex]];
    }
  }
}

export class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
}

export function freshDeck() {
  return SUITS.flatMap(suit => VALUES.map(value => new Card(suit, value)));
} 