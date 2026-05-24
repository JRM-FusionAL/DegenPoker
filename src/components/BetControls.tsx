import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

interface Props {
  bet: number;      // cents
  onBetOne: () => void;
  onBetMax: () => void;
  disabled: boolean;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BetControls({ bet, onBetOne, onBetMax, disabled }: Props) {
  const isJackpot = bet >= 200;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.btnBet, pressed && styles.btnPressed, disabled && styles.btnDisabled]}
        onPress={onBetOne}
        disabled={disabled}
      >
        <Text style={styles.btnLabel}>BET +$0.25</Text>
      </Pressable>

      <View style={styles.betDisplay}>
        <Text style={styles.betAmt}>{fmt(bet)}</Text>
        {isJackpot && <Text style={styles.jackpotTag}>⚡ JACKPOT</Text>}
      </View>

      <Pressable
        style={({ pressed }) => [styles.btn, styles.btnMax, pressed && styles.btnPressed, disabled && styles.btnDisabled]}
        onPress={onBetMax}
        disabled={disabled}
      >
        <Text style={styles.btnLabel}>MAX $5</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  btnBet: { backgroundColor: '#0e0e5a', borderColor: '#3355bb' },
  btnMax: { backgroundColor: '#5a2200', borderColor: '#aa5500' },
  btnPressed: { opacity: 0.7 },
  btnDisabled: { opacity: 0.35 },
  btnLabel: {
    fontFamily: fonts.mono, fontSize: 10, fontWeight: 'bold', color: colors.textPrimary,
  },
  betDisplay: { alignItems: 'center', minWidth: 96 },
  betAmt: {
    fontFamily: fonts.mono, fontSize: 20, fontWeight: 'bold', color: colors.gold,
  },
  jackpotTag: {
    fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 1, marginTop: 2,
  },
});
