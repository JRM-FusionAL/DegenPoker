import { Card, Rank } from '../../types/card';
import { HandResult } from '../../types/game';
import { PayTable } from '../../types/paytable';
import { computeStats, getHighPairRank, RANK_VALUES } from '../../utils/handEvaluator';

export const PAYTABLE: PayTable = [
  { handName: 'Royal Flush',     multipliers: [250,  500,  750,  1000, 4000] },
  { handName: 'Straight Flush',  multipliers: [50,   100,  150,  200,  250]  },
  { handName: 'Four Aces',       multipliers: [160,  320,  480,  640,  800]  },
  { handName: 'Four 2s-4s',      multipliers: [80,   160,  240,  320,  400]  },
  { handName: 'Four 5s-Kings',   multipliers: [50,   100,  150,  200,  250]  },
  { handName: 'Full House',      multipliers: [10,   20,   30,   40,   50]   },
  { handName: 'Flush',           multipliers: [7,    14,   21,   28,   35]   },
  { handName: 'Straight',        multipliers: [5,    10,   15,   20,   25]   },
  { handName: 'Three of a Kind', multipliers: [3,    6,    9,    12,   15]   },
  { handName: 'Two Pair',        multipliers: [1,    2,    3,    4,    5]    },
  { handName: 'Jacks or Better', multipliers: [1,    2,    3,    4,    5]    },
];

const LOW_QUADS: Rank[] = ['2', '3', '4'];

export function evaluate(cards: Card[], bet: number): HandResult {
  const stats = computeStats(cards);
  const betIdx = Math.min(bet, 5) - 1;
  const noWin: HandResult = { name: '', tableIndex: -1, payout: 0 };

  if (stats.isRoyal)
    return { name: 'Royal Flush', tableIndex: 0, payout: PAYTABLE[0].multipliers[betIdx] };
  if (stats.isFlush && stats.isStraight)
    return { name: 'Straight Flush', tableIndex: 1, payout: PAYTABLE[1].multipliers[betIdx] };

  if (stats.maxCount >= 4) {
    // Find which rank has 4+
    const quadRank = [...stats.rankCounts.entries()].find(([, c]) => c >= 4)?.[0] as Rank;
    if (quadRank === 'A')
      return { name: 'Four Aces', tableIndex: 2, payout: PAYTABLE[2].multipliers[betIdx] };
    if (LOW_QUADS.includes(quadRank))
      return { name: 'Four 2s-4s', tableIndex: 3, payout: PAYTABLE[3].multipliers[betIdx] };
    return { name: 'Four 5s-Kings', tableIndex: 4, payout: PAYTABLE[4].multipliers[betIdx] };
  }

  if (stats.maxCount === 3 && stats.pairs >= 2)
    return { name: 'Full House', tableIndex: 5, payout: PAYTABLE[5].multipliers[betIdx] };
  if (stats.isFlush)
    return { name: 'Flush', tableIndex: 6, payout: PAYTABLE[6].multipliers[betIdx] };
  if (stats.isStraight)
    return { name: 'Straight', tableIndex: 7, payout: PAYTABLE[7].multipliers[betIdx] };
  if (stats.maxCount === 3)
    return { name: 'Three of a Kind', tableIndex: 8, payout: PAYTABLE[8].multipliers[betIdx] };
  if (stats.pairs >= 2)
    return { name: 'Two Pair', tableIndex: 9, payout: PAYTABLE[9].multipliers[betIdx] };
  if (stats.pairs === 1 && getHighPairRank(stats.rankCounts) >= RANK_VALUES['J'])
    return { name: 'Jacks or Better', tableIndex: 10, payout: PAYTABLE[10].multipliers[betIdx] };

  return noWin;
}
