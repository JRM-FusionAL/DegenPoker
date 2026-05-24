import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PayTable as PayTableType } from '../types/paytable';
import { colors, fonts } from '../theme/colors';

interface Props {
  paytable: PayTableType;
  currentBet: number;      // cents
  winningTableIndex?: number;
  jackpotValue?: number;   // cents
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PayTable({ paytable, currentBet, winningTableIndex = -1, jackpotValue = 0 }: Props) {
  const isJackpot = currentBet >= 200;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.handCell, styles.headerText]}>HAND</Text>
        <Text style={[styles.cell, styles.headerText, styles.paysCell]}>PAYS</Text>
      </View>

      {paytable.map((entry, rowIdx) => {
        const isWinning = rowIdx === winningTableIndex;
        const isTopHand = rowIdx === 0;
        const payoutCents = entry.multipliers[0] * currentBet;

        return (
          <View key={entry.handName} style={[styles.row, isWinning && styles.rowWinning]}>
            <Text style={[styles.cell, styles.handCell, styles.handText, isWinning && styles.winningText]}>
              {isTopHand && isJackpot ? 'JACKPOT!' : entry.handName}
            </Text>
            <Text style={[
              styles.cell, styles.paysCell, styles.multText,
              isWinning && styles.winningText,
              isTopHand && isJackpot && styles.jackpotText,
            ]}>
              {isTopHand && isJackpot
                ? fmt(jackpotValue)
                : fmt(payoutCents)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#2a2a18',
    borderRadius: 6,
    marginHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a18',
    paddingVertical: 6,
    backgroundColor: '#111108',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a10',
  },
  rowWinning: { backgroundColor: '#1a1200' },
  cell: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    textAlign: 'center',
  },
  handCell: { flex: 1, textAlign: 'left', paddingLeft: 8, fontSize: 10 },
  paysCell: { width: 88, textAlign: 'right', paddingRight: 10 },
  headerText: { color: colors.gold, fontWeight: 'bold' },
  handText: { color: '#c8c0a8' },
  multText: { color: '#887860', fontWeight: 'bold' },
  winningText: { color: colors.gold, fontWeight: 'bold' },
  jackpotText: { color: colors.goldBright, fontWeight: 'bold' },
});
