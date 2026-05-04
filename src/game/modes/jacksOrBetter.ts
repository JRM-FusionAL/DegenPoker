import { Card } from '../../types/card';
import { HandResult } from '../../types/game';
import { PayTable } from '../../types/paytable';
import { computeStats, getHighPairRank, RANK_VALUES } from '../../utils/handEvaluator';

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

  const noWin: HandResult = { name: '', tableIndex: -1, payout: 0 };

  if (stats.isRoyal)
    return { name: 'Royal Flush', tableIndex: 0, payout: PAYTABLE[0].multipliers[betIdx] };
  if (stats.isFlush && stats.isStraight)
    return { name: 'Straight Flush', tableIndex: 1, payout: PAYTABLE[1].multipliers[betIdx] };
  if (stats.maxCount >= 4)
    return { name: 'Four of a Kind', tableIndex: 2, payout: PAYTABLE[2].multipliers[betIdx] };
  if (stats.maxCount === 3 && stats.pairs >= 2)
    return { name: 'Full House', tableIndex: 3, payout: PAYTABLE[3].multipliers[betIdx] };
  if (stats.isFlush)
    return { name: 'Flush', tableIndex: 4, payout: PAYTABLE[4].multipliers[betIdx] };
  if (stats.isStraight)
    return { name: 'Straight', tableIndex: 5, payout: PAYTABLE[5].multipliers[betIdx] };
  if (stats.maxCount === 3)
    return { name: 'Three of a Kind', tableIndex: 6, payout: PAYTABLE[6].multipliers[betIdx] };
  if (stats.pairs >= 2)
    return { name: 'Two Pair', tableIndex: 7, payout: PAYTABLE[7].multipliers[betIdx] };
  // Jacks or better: single pair with J, Q, K, or A
  if (stats.pairs === 1 && getHighPairRank(stats.rankCounts) >= RANK_VALUES['J'])
    return { name: 'Jacks or Better', tableIndex: 8, payout: PAYTABLE[8].multipliers[betIdx] };

  return noWin;
}
