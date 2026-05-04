import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GamePhase } from '../types/game';
import { colors, fonts, glow } from '../theme/colors';

interface Props {
  phase: GamePhase;
  onPress: () => void;
  disabled?: boolean;
}

export function DealDrawButton({ phase, onPress, disabled }: Props) {
  const label = phase === 'dealt' ? 'DRAW' : 'DEAL';
  const isDrawn = phase === 'drawn';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        isDrawn ? styles.btnNewGame : styles.btnDeal,
        pressed && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.label}>{isDrawn ? 'NEW GAME' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 8,
  },
  btnDeal: {
    backgroundColor: '#880000',
    borderColor: colors.neonRed,
    ...glow.red,
  },
  btnNewGame: {
    backgroundColor: '#004400',
    borderColor: colors.neonGreen,
    ...glow.green,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  label: {
    fontFamily: fonts.retro,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
});
