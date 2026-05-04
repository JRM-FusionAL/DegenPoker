export interface PayTableEntry {
  handName: string;
  // multipliers[i] = payout for (i+1) coins
  multipliers: [number, number, number, number, number];
}

export type PayTable = PayTableEntry[];
