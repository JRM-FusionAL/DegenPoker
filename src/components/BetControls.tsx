import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, glow } from '../theme/colors';

interface Props {
  bet: number;
  onBetOne: () => void;
  onBetMax: () => void;
  disabled: boolean;
}

export function BetControls({ bet, onBetOne, onBetMax, disabled }: Props) {
  const nextBet = bet >= 5 ? 1 : bet + 1;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.btn, styles.btnBet, disabled && styles.btnDisabled]}
        onPress={onBetOne}
        disabled={disabled}
      >
        <Text style={styles.btnLabel}>BET ONE</Text>
        <Text style={styles.btnSub}>→ {nextBet}</Text>
      </Pressable>

      {/* Coin dots */}
      <View style={styles.coinsRow}>
        {[1,2,3,4,5].map(n => (
          <View
            key={n}
            style={[styles.coin, n <= bet && styles.coinActive, n <= bet && glow.gold]}
          />
        ))}
      </View>

      <Pressable
        style={[styles.btn, styles.btnMax, disabled && styles.btnDisabled]}
        onPress={onBetMax}
        disabled={disabled}
      >
        <Text style={styles.btnLabel}>BET MAX</Text>
        <Text style={styles.btnSub}>5 COINS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 6,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnBet: {
    backgroundColor: colors.buttonBet,
    borderColor: colors.buttonBetBorder,
    ...glow.cyan,
  },
  btnMax: {
    backgroundColor: '#442200',
    borderColor: colors.neonOrange,
    ...glow.red,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnLabel: {
    fontFamily: fonts.retro,
    fontSize: 8,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  btnSub: {
    fontFamily: fonts.retro,
    fontSize: 6,
    color: colors.textDim,
    marginTop: 2,
  },
  coinsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  coin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#222233',
    borderWidth: 1,
    borderColor: '#333355',
  },
  coinActive: {
    backgroundColor: colors.neonGold,
    borderColor: colors.neonGold,
  },
});
