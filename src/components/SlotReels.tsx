import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SlotSymbol } from '../types/slot';
import { colors, fonts } from '../theme/colors';
import { randomNonBlank } from '../game/slots/slotMachine';

interface ReelProps {
  finalSymbols: SlotSymbol[];
  stopped: boolean;
  cellSize: number;
  highlightCenter?: boolean;
  winningRows?: number[];
}

const SYM_LABELS: Record<SlotSymbol, string> = {
  WILD: 'WILD', SCATTER: '★', SEVEN: '7', BAR: 'BAR',
  DBAR: '2BAR', TBAR: '3BAR', DIAMOND: '♦', BELL: '🔔',
  CHERRY: '🍒', ORANGE: '🍊', LEMON: '🍋', BLANK: '',
};

const SYM_BG: Record<SlotSymbol, string> = {
  WILD: '#b8860b', SCATTER: '#5533aa', SEVEN: '#ffffff',
  BAR: '#dddddd', DBAR: '#dddddd', TBAR: '#dddddd',
  DIAMOND: '#ffffff', BELL: '#ffffff', CHERRY: '#ffffff',
  ORANGE: '#ffffff', LEMON: '#ffffff', BLANK: '#0a1a0a',
};

const SYM_COLOR: Record<SlotSymbol, string> = {
  WILD: '#ffffff', SCATTER: '#ffffff', SEVEN: '#cc0000',
  BAR: '#333333', DBAR: '#333333', TBAR: '#333333',
  DIAMOND: '#00aacc', BELL: '#888800', CHERRY: '#cc0000',
  ORANGE: '#cc6600', LEMON: '#aaaa00', BLANK: '#0a1a0a',
};

function SymbolCell({
  symbol, size, isCenter, isWin,
}: {
  symbol: SlotSymbol; size: number; isCenter: boolean; isWin: boolean;
}) {
  const label = SYM_LABELS[symbol];
  const fontSize = symbol === 'WILD' ? size * 0.26 :
    symbol === 'BLANK' ? 0 :
    ['BAR', 'DBAR', 'TBAR'].includes(symbol) ? size * 0.24 :
    size * 0.44;

  return (
    <View style={[
      styles.cell,
      { width: size, height: size, backgroundColor: SYM_BG[symbol] },
      isCenter && styles.cellCenter,
      isWin && styles.cellWin,
    ]}>
      {label ? (
        <Text style={[
          styles.symText,
          { color: SYM_COLOR[symbol], fontSize },
          symbol === 'WILD' && styles.wildText,
        ]} adjustsFontSizeToFit numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function SlotReel({ finalSymbols, stopped, cellSize, winningRows = [] }: ReelProps) {
  const [display, setDisplay] = useState<SlotSymbol[]>(['BLANK', 'BLANK', 'BLANK']);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stopped) {
      timerRef.current = setInterval(() => {
        setDisplay([randomNonBlank(), randomNonBlank(), randomNonBlank()]);
      }, 80);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplay(finalSymbols);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stopped, finalSymbols]);

  return (
    <View style={styles.reel}>
      {display.map((sym, rowIdx) => (
        <SymbolCell
          key={rowIdx}
          symbol={sym}
          size={cellSize}
          isCenter={rowIdx === 1}
          isWin={winningRows.includes(rowIdx)}
        />
      ))}
    </View>
  );
}

interface Props {
  grid: SlotSymbol[][];
  reelCount: 3 | 5;
  reelStopped: boolean[];
  winningPaylines?: number[];
  paylines?: number[][];
}

export function SlotReels({ grid, reelCount, reelStopped, winningPaylines = [], paylines = [] }: Props) {
  const cellSize = reelCount === 3 ? 88 : 58;

  // Determine winning rows per reel
  const winRows: number[][] = Array(reelCount).fill(null).map(() => []);
  for (const plIdx of winningPaylines) {
    const pl = paylines[plIdx];
    if (!pl) continue;
    pl.forEach((rowIdx, reelIdx) => {
      if (!winRows[reelIdx].includes(rowIdx)) winRows[reelIdx].push(rowIdx);
    });
  }

  const emptyGrid = grid.length === 0;
  const defaultGrid: SlotSymbol[][] = Array(reelCount).fill(null).map(() => ['BLANK', 'BLANK', 'BLANK']);
  const displayGrid = emptyGrid ? defaultGrid : grid;

  return (
    <View style={styles.container}>
      {Array(reelCount).fill(null).map((_, ri) => (
        <SlotReel
          key={ri}
          finalSymbols={displayGrid[ri] ?? ['BLANK', 'BLANK', 'BLANK']}
          stopped={reelStopped[ri] ?? true}
          cellSize={cellSize}
          winningRows={winRows[ri] ?? []}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
    backgroundColor: '#050e05',
    borderWidth: 2,
    borderColor: '#2a2a18',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  reel: {
    gap: 3,
  },
  cell: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  cellCenter: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  cellWin: {
    borderColor: '#ffdd00',
    borderWidth: 2.5,
    shadowColor: '#ffdd00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  symText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wildText: {
    fontFamily: fonts.mono,
    letterSpacing: 1,
  },
});
