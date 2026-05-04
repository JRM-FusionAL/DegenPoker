import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PayTable as PayTableType } from '../types/paytable';
import { colors, fonts } from '../theme/colors';

interface Props {
  paytable: PayTableType;
  currentBet: number;
  winningTableIndex?: number; // highlight the current winning hand
}

export function PayTable({ paytable, currentBet, winningTableIndex = -1 }: Props) {
  const betIdx = Math.min(currentBet, 5) - 1;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.handCell, styles.headerText]}>HAND</Text>
        {[1,2,3,4,5].map(n => (
          <Text
            key={n}
            style={[styles.cell, styles.headerText, n - 1 === betIdx && styles.betActive]}
          >
            {n}
          </Text>
        ))}
      </View>

      {paytable.map((entry, rowIdx) => {
        const isWinning = rowIdx === winningTableIndex;
        return (
          <View key={entry.handName} style={[styles.row, isWinning && styles.rowWinning]}>
            <Text style={[styles.cell, styles.handCell, styles.handText, isWinning && styles.winningText]}>
              {entry.handName}
            </Text>
            {entry.multipliers.map((mult, colIdx) => (
              <Text
                key={colIdx}
                style={[
                  styles.cell,
                  styles.multText,
                  colIdx === betIdx && styles.betActive,
                  isWinning && styles.winningText,
                ]}
              >
                {mult}
              </Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
    borderWidth: 1,
    borderColor: '#1a1a44',
    borderRadius: 6,
    marginHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222244',
    paddingVertical: 4,
    backgroundColor: '#0a0a1e',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#11113a',
  },
  rowWinning: {
    backgroundColor: '#1a1200',
  },
  cell: {
    fontFamily: fonts.retro,
    fontSize: 7,
    color: colors.textDim,
    textAlign: 'center',
    width: 36,
  },
  handCell: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 6,
    fontSize: 7,
  },
  headerText: {
    color: colors.neonCyan,
    letterSpacing: 0.5,
  },
  handText: {
    color: '#aaaacc',
  },
  multText: {
    color: '#888899',
  },
  betActive: {
    color: colors.neonGold,
  },
  winningText: {
    color: colors.neonGold,
  },
});
