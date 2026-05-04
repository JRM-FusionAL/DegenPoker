import { Card, Rank } from '../types/card';

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, 'JOKER': 0,
};

export interface HandStats {
  rankCounts: Map<Rank, number>;
  isFlush: boolean;
  isStraight: boolean;
  isRoyal: boolean;  // A-K-Q-J-10 of same suit
  maxCount: number;
  pairs: number;
  wildcardCount: number;
  // For wild-card games: best natural (non-wild) hand stats
  naturalRankCounts: Map<Rank, number>;
}

function getRankCounts(cards: Card[]): Map<Rank, number> {
  const map = new Map<Rank, number>();
  for (const c of cards) {
    map.set(c.rank, (map.get(c.rank) ?? 0) + 1);
  }
  return map;
}

function checkFlush(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  const suit = cards[0].suit;
  return cards.every(c => c.suit === suit);
}

function checkStraight(ranks: number[]): boolean {
  if (ranks.length < 5) return false;
  const sorted = [...new Set(ranks)].sort((a, b) => a - b);
  if (sorted.length < 5) return false;
  // Normal straight
  if (sorted[4] - sorted[0] === 4) return true;
  // Ace-low straight: A-2-3-4-5
  const aceLow = sorted.includes(14)
    ? [...sorted.filter(r => r !== 14), 1].sort((a, b) => a - b)
    : null;
  if (aceLow && aceLow[4] - aceLow[0] === 4) return true;
  return false;
}

function checkRoyal(cards: Card[]): boolean {
  const requiredRanks = new Set(['10', 'J', 'Q', 'K', 'A']);
  const cardRanks = new Set(cards.map(c => c.rank));
  return (
    checkFlush(cards) &&
    requiredRanks.size === cardRanks.size &&
    [...requiredRanks].every(r => cardRanks.has(r as Rank))
  );
}

/** Compute stats for a hand, treating wildRanks as wildcards. */
export function computeStats(cards: Card[], wildRanks: Rank[] = []): HandStats {
  const naturals = cards.filter(c => !wildRanks.includes(c.rank));
  const wildcardCount = cards.length - naturals.length;

  const naturalRankCounts = getRankCounts(naturals);
  const isFlushNaturals = naturals.length <= 1 || checkFlush(naturals);

  // Generate best possible hand with wildcards
  // For simplicity, we enumerate the meaningful cases by number of wilds
  const isFlush = wildcardCount > 0
    ? (naturals.length === 0 || checkFlush(naturals))
    : checkFlush(cards);

  const naturalValues = naturals.map(c => RANK_VALUES[c.rank]);
  const allValues = cards.filter(c => !wildRanks.includes(c.rank)).map(c => RANK_VALUES[c.rank]);

  // For straights with wilds, check if a straight is possible
  let isStraight = false;
  if (wildcardCount === 0) {
    isStraight = checkStraight(allValues);
  } else {
    isStraight = canMakeStraightWithWilds(naturalValues, wildcardCount);
  }

  // Royal flush check
  let isRoyal = false;
  if (wildcardCount === 0) {
    isRoyal = checkRoyal(cards);
  } else if (isFlush) {
    const royalRanks: Rank[] = ['10', 'J', 'Q', 'K', 'A'];
    const naturalHasRoyalRank = naturals.every(c => royalRanks.includes(c.rank));
    const uniqueNaturalRoyals = new Set(naturals.filter(c => royalRanks.includes(c.rank)));
    isRoyal = naturalHasRoyalRank && (uniqueNaturalRoyals.size + wildcardCount >= 5);
  }

  // Compute effective rank counts including wilds filling up to best group
  const rankCounts = new Map(naturalRankCounts);
  // Add wildcard to highest existing group to inflate maxCount
  if (wildcardCount > 0) {
    const entries = [...rankCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) {
      rankCounts.set(entries[0][0], entries[0][1] + wildcardCount);
    } else {
      // All wilds — treat as 5 aces
      rankCounts.set('A', wildcardCount);
    }
  }

  const counts = [...rankCounts.values()];
  const maxCount = Math.max(...counts, 0);
  const pairs = counts.filter(c => c >= 2).length;

  return {
    rankCounts,
    isFlush,
    isStraight,
    isRoyal,
    maxCount,
    pairs,
    wildcardCount,
    naturalRankCounts,
  };
}

function canMakeStraightWithWilds(naturalValues: number[], wilds: number): boolean {
  if (naturalValues.length === 0) return true; // all wilds = any straight
  const uniq = [...new Set(naturalValues)];
  if (uniq.length !== naturalValues.length) return false; // pair = can't be straight

  // Try all possible 5-card windows (2-6, 3-7, ... 10-A, A-low A-5)
  const windows = [
    [2,3,4,5,6],[3,4,5,6,7],[4,5,6,7,8],[5,6,7,8,9],
    [6,7,8,9,10],[7,8,9,10,11],[8,9,10,11,12],[9,10,11,12,13],
    [10,11,12,13,14],[1,2,3,4,5], // ace-low
  ];
  return windows.some(window => {
    const needed = window.filter(v => !uniq.includes(v));
    return needed.length <= wilds;
  });
}

/** Check if naturals form a royal flush without wilds (for Jokers Wild natural royal). */
export function isNaturalRoyal(cards: Card[], wildRanks: Rank[]): boolean {
  const naturals = cards.filter(c => !wildRanks.includes(c.rank));
  return naturals.length === 5 && checkRoyal(naturals);
}

/** Check if naturals have all four of a specific rank (for Four Deuces). */
export function hasFourOfRank(cards: Card[], rank: Rank): boolean {
  return cards.filter(c => c.rank === rank).length === 4;
}

/** Get the highest pair rank value from rank counts. */
export function getHighPairRank(rankCounts: Map<Rank, number>): number {
  let highest = 0;
  for (const [rank, count] of rankCounts) {
    if (count >= 2) {
      const val = RANK_VALUES[rank];
      if (val > highest) highest = val;
    }
  }
  return highest;
}
