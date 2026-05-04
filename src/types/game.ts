import { Card } from './card';
import { PayTable } from './paytable';

export type GameMode =
  | 'jacksOrBetter'
  | 'jokersWild'
  | 'deucesWild'
  | 'bonusPoker'
  | 'shamrocks';

export type GamePhase = 'idle' | 'dealt' | 'drawn';

export interface HandResult {
  name: string;
  tableIndex: number; // row index in paytable (-1 = no win)
  payout: number;
}

export interface GameState {
  credits: number;
  highScore: number;
  bet: number;
  hand: Card[];
  heldCards: boolean[];
  phase: GamePhase;
  lastWin: HandResult | null;
  gameMode: GameMode;
}

export interface GameModeDefinition {
  id: GameMode;
  label: string;
  description: string;
  paytable: PayTable;
  usesJoker: boolean;
  evaluate: (cards: Card[], bet: number) => HandResult;
}
