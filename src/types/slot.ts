export type SlotMode = 'lucky7s' | 'spinWin' | 'doubleDiamond';

export type SlotSymbol =
  | 'WILD' | 'SCATTER' | 'SEVEN' | 'BAR' | 'DBAR' | 'TBAR'
  | 'DIAMOND' | 'BELL' | 'CHERRY' | 'ORANGE' | 'LEMON' | 'BLANK';

export interface SlotPayEntry {
  symbol: SlotSymbol;
  count3: number;   // multiplier for 3-of-a-kind (0 = no pay)
  count4: number;
  count5: number;
  isJackpotSlot?: boolean;
}

export interface SlotMachineConfig {
  id: SlotMode;
  label: string;
  description: string;
  reelCount: 3 | 5;
  rowCount: 3;
  paylineCount: number;
  paylines: number[][];        // [paylineIndex][reelIndex] = rowIndex
  reelStrips: SlotSymbol[][];  // one strip per reel
  paytable: SlotPayEntry[];
  scatterSymbol?: SlotSymbol;
  wildSymbol?: SlotSymbol;
  freeSpinsOnScatter?: number;
}

export interface WinningPayline {
  paylineIndex: number;
  symbol: SlotSymbol;
  count: number;
  payout: number;  // cents
  wildMultiplier?: number;
}

export interface SlotResult {
  grid: SlotSymbol[][];   // [reel][row]
  winningPaylines: WinningPayline[];
  scatterCount: number;
  freeSpinsAwarded: number;
  totalPayout: number;    // cents
  isJackpot: boolean;
}

export interface SlotState {
  credits: number;           // cents
  highScore: number;         // cents
  bet: number;               // cents (25–500, step 25)
  jackpot: number;           // cents
  grid: SlotSymbol[][];
  reelStopped: boolean[];
  lastResult: SlotResult | null;
  phase: 'idle' | 'spinning' | 'result';
  freeSpinsRemaining: number;
  freeSpinsMultiplier: number;
}
