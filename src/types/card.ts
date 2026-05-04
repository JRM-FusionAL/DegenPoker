export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type Rank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isShamrock?: boolean;
}
