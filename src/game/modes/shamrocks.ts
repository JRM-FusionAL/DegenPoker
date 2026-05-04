import { Card } from '../../types/card';
import { HandResult } from '../../types/game';
import { PayTable } from '../../types/paytable';
import { computeStats, getHighPairRank, RANK_VALUES } from '../../utils/handEvaluator';

// Same base paytable as Jacks or Better; shamrock cards apply a 2x multiplier each
export const PAYTABLE: PayTable = [
  { handName: 'Royal Flush',     multipliers: [250, 500, 750, 1000, 4000] },
  { handName: 'Straight Flush',  multipliers: [50,  100, 150, 200,  250]  },
  { handName: 'Four of a Kind',  multipliers: [25,  50,  75,  100,  125]  },
  { handName: 'Full House',      multipliers: [9,   18,  27,  36,   45]   },
  { handName: 'Flush',           multipliers: [6,   12,  18,  24,   30]   },
  { handName: 'Straight',        multipliers: [4,   8,   12,  16,   20]   },
  { handName: 'Three of a Kind', multipliers: [3,   6,   9,   12,   15]   },
  { handName: 'Two Pair',        multipliers: [2,   4,   6,   8,    10]   },
  { handName: 'Jacks or Better', multipliers: [1,   2,   3,   4,    5]    },
];

export function evaluate(cards: Card[], bet: number): HandResult {
  const stats = computeStats(cards);
  const betIdx = Math.min(bet, 5) - 1;
  const shamrockCount = cards.filter(c => c.isShamrock).length;
  // Each shamrock in final hand doubles the payout (2^n multiplier)
  const shamrockMultiplier = Math.pow(2, shamrockCount);

  const win = (name: string, tableIndex: number): HandResult => {
    const base = PAYTABLE[tableIndex].multipliers[betIdx];
    return { name, tableIndex, payout: base * shamrockMultiplier };
  };

  const noWin: HandResult = { name: '', tableIndex: -1, payout: 0 };

  if (stats.isRoyal) return win('Royal Flush', 0);
  if (stats.isFlush && stats.isStraight) return win('Straight Flush', 1);
  if (stats.maxCount >= 4) return win('Four of a Kind', 2);
  if (stats.maxCount === 3 && stats.pairs >= 2) return win('Full House', 3);
  if (stats.isFlush) return win('Flush', 4);
  if (stats.isStraight) return win('Straight', 5);
  if (stats.maxCount === 3) return win('Three of a Kind', 6);
  if (stats.pairs >= 2) return win('Two Pair', 7);
  if (stats.pairs === 1 && getHighPairRank(stats.rankCounts) >= RANK_VALUES['J'])
    return win('Jacks or Better', 8);

  return noWin;
}
