import { Card, Rank, Suit } from '../types/card';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

let _idCounter = 0;
function uid(): string {
  return `card-${++_idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createDeck(includeJoker = false): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: uid(), suit, rank });
    }
  }
  if (includeJoker) {
    deck.push({ id: uid(), suit: 'joker', rank: 'JOKER' });
    deck.push({ id: uid(), suit: 'joker', rank: 'JOKER' });
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function dealCards(deck: Card[], count: number): { hand: Card[]; remaining: Card[] } {
  return { hand: deck.slice(0, count), remaining: deck.slice(count) };
}

export function applyShamrocks(hand: Card[], chance = 0.15): Card[] {
  return hand.map(card => ({
    ...card,
    isShamrock: Math.random() < chance,
  }));
}
