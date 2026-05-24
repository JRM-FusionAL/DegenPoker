import { SlotMachineConfig, SlotMode, SlotPayEntry, SlotResult, SlotSymbol, WinningPayline } from '../../types/slot';

// ─── Reel strips ────────────────────────────────────────────────────────────
function makeStrip(spec: [SlotSymbol, number][]): SlotSymbol[] {
  const strip: SlotSymbol[] = [];
  for (const [sym, count] of spec) {
    for (let i = 0; i < count; i++) strip.push(sym);
  }
  return strip;
}

const LUCKY7_STRIP = makeStrip([
  ['BLANK', 10], ['CHERRY', 6], ['BAR', 5], ['DBAR', 4], ['TBAR', 3], ['SEVEN', 2],
]);

const SPIN_WIN_STRIP_R0 = makeStrip([
  ['BLANK', 6], ['LEMON', 7], ['ORANGE', 7], ['CHERRY', 7], ['BELL', 6],
  ['BAR', 5], ['DIAMOND', 4], ['SEVEN', 3], ['SCATTER', 3], ['WILD', 2],
]);

const SPIN_WIN_STRIP = makeStrip([
  ['BLANK', 8], ['LEMON', 7], ['ORANGE', 7], ['CHERRY', 6], ['BELL', 5],
  ['BAR', 4], ['DIAMOND', 3], ['SEVEN', 2], ['SCATTER', 2], ['WILD', 1],
]);

const DIAM_STRIP = makeStrip([
  ['BLANK', 12], ['CHERRY', 6], ['BAR', 5], ['DBAR', 3], ['TBAR', 2], ['SEVEN', 2], ['DIAMOND', 1],
]);

// ─── Paytables ───────────────────────────────────────────────────────────────
const LUCKY7_PAY: SlotPayEntry[] = [
  { symbol: 'SEVEN',  count3: 50,  count4: 0, count5: 0 },
  { symbol: 'TBAR',   count3: 20,  count4: 0, count5: 0 },
  { symbol: 'DBAR',   count3: 10,  count4: 0, count5: 0 },
  { symbol: 'BAR',    count3: 5,   count4: 0, count5: 0 },
  { symbol: 'CHERRY', count3: 2,   count4: 0, count5: 0 },
];

const SPIN_WIN_PAY: SlotPayEntry[] = [
  { symbol: 'WILD',   count3: 50,  count4: 100, count5: 200, isJackpotSlot: true },
  { symbol: 'SEVEN',  count3: 10,  count4: 50,  count5: 200 },
  { symbol: 'DIAMOND',count3: 8,   count4: 40,  count5: 100 },
  { symbol: 'BAR',    count3: 5,   count4: 20,  count5: 50  },
  { symbol: 'BELL',   count3: 3,   count4: 12,  count5: 25  },
  { symbol: 'CHERRY', count3: 2,   count4: 8,   count5: 15  },
  { symbol: 'ORANGE', count3: 1,   count4: 5,   count5: 10  },
  { symbol: 'LEMON',  count3: 1,   count4: 3,   count5: 5   },
];

const DOUBLE_DIAM_PAY: SlotPayEntry[] = [
  { symbol: 'SEVEN',  count3: 50,  count4: 0, count5: 0 },
  { symbol: 'TBAR',   count3: 20,  count4: 0, count5: 0 },
  { symbol: 'DBAR',   count3: 10,  count4: 0, count5: 0 },
  { symbol: 'BAR',    count3: 5,   count4: 0, count5: 0 },
  { symbol: 'CHERRY', count3: 2,   count4: 0, count5: 0 },
  { symbol: 'DIAMOND',count3: 100, count4: 0, count5: 0 },
];

// ─── Machine configs ─────────────────────────────────────────────────────────
export const LUCKY7S: SlotMachineConfig = {
  id: 'lucky7s',
  label: 'Lucky 7s',
  description: '3-reel classic slots',
  reelCount: 3,
  rowCount: 3,
  paylineCount: 3,
  paylines: [[1,1,1],[0,0,0],[2,2,2]],
  reelStrips: [LUCKY7_STRIP, LUCKY7_STRIP, LUCKY7_STRIP],
  paytable: LUCKY7_PAY,
};

export const SPIN_WIN: SlotMachineConfig = {
  id: 'spinWin',
  label: 'Spin & Win',
  description: '5-reel • 9 lines • The Mint',
  reelCount: 5,
  rowCount: 3,
  paylineCount: 9,
  paylines: [
    [1,1,1,1,1], // center
    [0,0,0,0,0], // top
    [2,2,2,2,2], // bottom
    [0,1,2,1,0], // V
    [2,1,0,1,2], // ^
    [1,0,0,0,1], // dip-top
    [1,2,2,2,1], // dip-bottom
    [0,0,1,2,2], // diagonal down
    [2,2,1,0,0], // diagonal up
  ],
  reelStrips: [SPIN_WIN_STRIP_R0, SPIN_WIN_STRIP, SPIN_WIN_STRIP, SPIN_WIN_STRIP, SPIN_WIN_STRIP],
  paytable: SPIN_WIN_PAY,
  scatterSymbol: 'SCATTER',
  wildSymbol: 'WILD',
  freeSpinsOnScatter: 10,
};

export const DOUBLE_DIAMOND: SlotMachineConfig = {
  id: 'doubleDiamond',
  label: 'Double Diamond',
  description: '3-reel • Diamonds wild',
  reelCount: 3,
  rowCount: 3,
  paylineCount: 3,
  paylines: [[1,1,1],[0,0,0],[2,2,2]],
  reelStrips: [DIAM_STRIP, DIAM_STRIP, DIAM_STRIP],
  paytable: DOUBLE_DIAM_PAY,
  wildSymbol: 'DIAMOND',
};

export const SLOT_MACHINES: SlotMachineConfig[] = [LUCKY7S, SPIN_WIN, DOUBLE_DIAMOND];

export function getSlotMachine(mode: SlotMode): SlotMachineConfig {
  return SLOT_MACHINES.find(m => m.id === mode) ?? LUCKY7S;
}

// ─── Evaluation ──────────────────────────────────────────────────────────────
const ALL_SYMS: SlotSymbol[] = ['SEVEN','BAR','DBAR','TBAR','CHERRY','ORANGE','LEMON','BELL','DIAMOND'];

function randomNonBlank(): SlotSymbol {
  return ALL_SYMS[Math.floor(Math.random() * ALL_SYMS.length)];
}

function spinReel(strip: SlotSymbol[]): SlotSymbol[] {
  const pos = Math.floor(Math.random() * strip.length);
  return [
    strip[(pos + strip.length - 1) % strip.length],
    strip[pos],
    strip[(pos + 1) % strip.length],
  ];
}

function eval3Reel(
  config: SlotMachineConfig,
  syms: SlotSymbol[],
  betCents: number,
  paylineIndex: number,
): WinningPayline | null {
  const { id, paytable, wildSymbol } = config;

  if (id === 'doubleDiamond') {
    const diamonds = syms.filter(s => s === 'DIAMOND').length;
    const nonDiam = syms.filter(s => s !== 'DIAMOND');

    if (diamonds === 3) {
      // 3 diamonds: jackpot hand
      return { paylineIndex, symbol: 'DIAMOND', count: 3, payout: 100 * betCents * 4, wildMultiplier: 4 };
    }
    if (nonDiam.length === 0) return null;
    const base = nonDiam[0];
    if (!nonDiam.every(s => s === base)) return null;
    const entry = paytable.find(e => e.symbol === base);
    if (!entry || entry.count3 === 0) return null;
    const mult = diamonds === 2 ? 4 : diamonds === 1 ? 2 : 1;
    return { paylineIndex, symbol: base, count: 3, payout: entry.count3 * betCents * mult, wildMultiplier: mult };
  }

  // Lucky 7s
  const [a, b, c] = syms;
  if (a === b && b === c) {
    const entry = paytable.find(e => e.symbol === a);
    if (!entry || entry.count3 === 0) return null;
    return { paylineIndex, symbol: a, count: 3, payout: entry.count3 * betCents };
  }
  // Mixed BARs
  const bars: SlotSymbol[] = ['BAR', 'DBAR', 'TBAR'];
  if (bars.includes(a) && bars.includes(b) && bars.includes(c)) {
    const entry = paytable.find(e => e.symbol === 'BAR');
    if (!entry) return null;
    return { paylineIndex, symbol: 'BAR', count: 3, payout: Math.max(1, Math.floor(entry.count3 / 2)) * betCents };
  }
  return null;
}

function eval5Reel(
  config: SlotMachineConfig,
  syms: SlotSymbol[],
  betCents: number,
  jackpotCents: number,
  paylineIndex: number,
): WinningPayline | null {
  const { paytable, wildSymbol, scatterSymbol } = config;

  // Find base symbol (first non-wild non-scatter)
  let base: SlotSymbol | null = null;
  for (const s of syms) {
    if (s !== wildSymbol && s !== scatterSymbol && s !== 'BLANK') {
      base = s;
      break;
    }
  }

  // Count consecutive matches from left
  let count = 0;
  for (const s of syms) {
    if (s === wildSymbol || s === base) count++;
    else break;
  }

  // All wilds = jackpot candidate
  if (syms.every(s => s === wildSymbol)) { base = 'WILD'; count = 5; }

  if (count < 3 || !base) return null;

  const entry = paytable.find(e => e.symbol === base);
  if (!entry) return null;

  const mult = count >= 5 ? entry.count5 : count === 4 ? entry.count4 : entry.count3;
  if (mult === 0) return null;

  if (entry.isJackpotSlot && count >= 5 && betCents >= 200) {
    return { paylineIndex, symbol: base, count, payout: jackpotCents };
  }

  return { paylineIndex, symbol: base, count, payout: mult * betCents };
}

// ─── Main spin function ───────────────────────────────────────────────────────
export function spinReels(
  config: SlotMachineConfig,
  betCents: number,
  jackpotCents: number,
): SlotResult {
  const { reelStrips, paylines, scatterSymbol, freeSpinsOnScatter, reelCount } = config;

  const grid: SlotSymbol[][] = reelStrips.map(strip => spinReel(strip));

  const winningPaylines: WinningPayline[] = [];

  for (let pi = 0; pi < paylines.length; pi++) {
    const payline = paylines[pi];
    const lineSyms: SlotSymbol[] = payline.map((rowIdx, reelIdx) => grid[reelIdx][rowIdx]);

    let win: WinningPayline | null = null;
    if (reelCount === 3) {
      win = eval3Reel(config, lineSyms, betCents, pi);
    } else {
      win = eval5Reel(config, lineSyms, betCents, jackpotCents, pi);
    }
    if (win) winningPaylines.push(win);
  }

  // Scatter count (whole grid)
  let scatterCount = 0;
  if (scatterSymbol) {
    for (const reel of grid) {
      for (const sym of reel) {
        if (sym === scatterSymbol) scatterCount++;
      }
    }
  }

  const freeSpinsAwarded = scatterCount >= 3 ? (freeSpinsOnScatter ?? 0) : 0;
  const totalPayout = winningPaylines.reduce((s, w) => s + w.payout, 0);
  const isJackpot = winningPaylines.some(w => w.payout === jackpotCents && jackpotCents > 0);

  return { grid, winningPaylines, scatterCount, freeSpinsAwarded, totalPayout, isJackpot };
}

export { randomNonBlank };
