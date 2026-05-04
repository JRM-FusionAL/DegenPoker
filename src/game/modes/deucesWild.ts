import { Card, Rank } from '../../types/card';
import { HandResult } from '../../types/game';
import { PayTable } from '../../types/paytable';
import { computeStats, isNaturalRoyal, hasFourOfRank } from '../../utils/handEvaluator';

const WILD: Rank[] = ['2'];

export const PAYTABLE: PayTable = [
  { handName: 'Natural Royal Flush', multipliers: [800,  1600, 2400, 3200, 4000] },
  { handName: 'Four Deuces',         multipliers: [200,  400,  600,  800,  1000] },
  { handName: 'Wild Royal Flush',    multipliers: [25,   50,   75,   100,  125]  },
  { handName: 'Five of a Kind',      multipliers: [16,   32,   48,   64,   80]   },
  { handName: 'Straight Flush',      multipliers: [13,   26,   39,   52,   65]   },
  { handName: 'Four of a Kind',      multipliers: [4,    8,    12,   16,   20]   },
  { handName: 'Full House',          multipliers: [4,    8,    12,   16,   20]   },
  { handName: 'Flush',               multipliers: [3,    6,    9,    12,   15]   },
  { handName: 'Straight',            multipliers: [2,    4,    6,    8,    10]   },
  { handName: 'Three of a Kind',     multipliers: [1,    2,    3,    4,    5]    },
];

export function evaluate(cards: Card[], bet: number): HandResult {
  const betIdx = Math.min(bet, 5) - 1;
  const stats = computeStats(cards, WILD);
  const noWin: HandResult = { name: '', tableIndex: -1, payout: 0 };

  if (isNaturalRoyal(cards, WILD))
    return { name: 'Natural Royal Flush', tableIndex: 0, payout: PAYTABLE[0].multipliers[betIdx] };

  if (hasFourOfRank(cards, '2'))
    return { name: 'Four Deuces', tableIndex: 1, payout: PAYTABLE[1].multipliers[betIdx] };

  if (stats.wildcardCount > 0 && stats.isRoyal)
    return { name: 'Wild Royal Flush', tableIndex: 2, payout: PAYTABLE[2].multipliers[betIdx] };

  if (stats.maxCount >= 5)
    return { name: 'Five of a Kind', tableIndex: 3, payout: PAYTABLE[3].multipliers[betIdx] };
  if (stats.isFlush && stats.isStraight)
    return { name: 'Straight Flush', tableIndex: 4, payout: PAYTABLE[4].multipliers[betIdx] };
  if (stats.maxCount >= 4)
    return { name: 'Four of a Kind', tableIndex: 5, payout: PAYTABLE[5].multipliers[betIdx] };
  if (stats.maxCount === 3 && stats.pairs >= 2)
    return { name: 'Full House', tableIndex: 6, payout: PAYTABLE[6].multipliers[betIdx] };
  if (stats.isFlush)
    return { name: 'Flush', tableIndex: 7, payout: PAYTABLE[7].multipliers[betIdx] };
  if (stats.isStraight)
    return { name: 'Straight', tableIndex: 8, payout: PAYTABLE[8].multipliers[betIdx] };
  if (stats.maxCount === 3)
    return { name: 'Three of a Kind', tableIndex: 9, payout: PAYTABLE[9].multipliers[betIdx] };

  return noWin;
}
