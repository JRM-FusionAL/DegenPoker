import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GamePhase } from '../types/game';
import { colors, fonts } from '../theme/colors';

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
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  btnDeal: {
    backgroundColor: '#8b0000',
    borderColor: '#cc2222',
  },
  btnNewGame: {
    backgroundColor: '#1a4a1a',
    borderColor: '#2aaa2a',
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 3,
  },
});
