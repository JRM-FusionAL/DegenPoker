import { Card, Rank } from '../../types/card';
import { HandResult } from '../../types/game';
import { PayTable } from '../../types/paytable';
import { computeStats, isNaturalRoyal, getHighPairRank, RANK_VALUES } from '../../utils/handEvaluator';

const WILD: Rank[] = ['JOKER'];

export const PAYTABLE: PayTable = [
  { handName: 'Natural Royal Flush', multipliers: [800,  1600, 2400, 3200, 4000] },
  { handName: 'Five of a Kind',      multipliers: [200,  400,  600,  800,  1000] },
  { handName: 'Wild Royal Flush',    multipliers: [100,  200,  300,  400,  500]  },
  { handName: 'Straight Flush',      multipliers: [50,   100,  150,  200,  250]  },
  { handName: 'Four of a Kind',      multipliers: [20,   40,   60,   80,   100]  },
  { handName: 'Full House',          multipliers: [7,    14,   21,   28,   35]   },
  { handName: 'Flush',               multipliers: [5,    10,   15,   20,   25]   },
  { handName: 'Straight',            multipliers: [3,    6,    9,    12,   15]   },
  { handName: 'Three of a Kind',     multipliers: [2,    4,    6,    8,    10]   },
  { handName: 'Two Pair',            multipliers: [1,    2,    3,    4,    5]    },
];

export function evaluate(cards: Card[], bet: number): HandResult {
  const betIdx = Math.min(bet, 5) - 1;
  const stats = computeStats(cards, WILD);
  const noWin: HandResult = { name: '', tableIndex: -1, payout: 0 };

  // Natural Royal — no jokers in hand
  if (isNaturalRoyal(cards, WILD))
    return { name: 'Natural Royal Flush', tableIndex: 0, payout: PAYTABLE[0].multipliers[betIdx] };

  // Five of a Kind requires a wild
  if (stats.wildcardCount > 0 && stats.maxCount >= 5)
    return { name: 'Five of a Kind', tableIndex: 1, payout: PAYTABLE[1].multipliers[betIdx] };

  // Wild Royal (royal with at least one joker)
  if (stats.wildcardCount > 0 && stats.isRoyal)
    return { name: 'Wild Royal Flush', tableIndex: 2, payout: PAYTABLE[2].multipliers[betIdx] };

  if (stats.isFlush && stats.isStraight)
    return { name: 'Straight Flush', tableIndex: 3, payout: PAYTABLE[3].multipliers[betIdx] };
  if (stats.maxCount >= 4)
    return { name: 'Four of a Kind', tableIndex: 4, payout: PAYTABLE[4].multipliers[betIdx] };
  if (stats.maxCount === 3 && stats.pairs >= 2)
    return { name: 'Full House', tableIndex: 5, payout: PAYTABLE[5].multipliers[betIdx] };
  if (stats.isFlush)
    return { name: 'Flush', tableIndex: 6, payout: PAYTABLE[6].multipliers[betIdx] };
  if (stats.isStraight)
    return { name: 'Straight', tableIndex: 7, payout: PAYTABLE[7].multipliers[betIdx] };
  if (stats.maxCount === 3)
    return { name: 'Three of a Kind', tableIndex: 8, payout: PAYTABLE[8].multipliers[betIdx] };
  // Kings or better pair (minimum winning pair with joker)
  if (stats.pairs >= 2)
    return { name: 'Two Pair', tableIndex: 9, payout: PAYTABLE[9].multipliers[betIdx] };

  return noWin;
}
