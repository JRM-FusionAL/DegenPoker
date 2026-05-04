import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, glow } from '../theme/colors';

interface Props {
  credits: number;
  bet: number;
  highScore: number;
}

export function CreditDisplay({ credits, bet, highScore }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.label}>CREDITS</Text>
        <Text style={[styles.value, glow.green]}>{credits}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>BET</Text>
        <Text style={[styles.value, { color: colors.neonGold }, glow.gold]}>{bet}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>HIGH</Text>
        <Text style={[styles.value, { color: colors.neonCyan }, glow.cyan]}>{highScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#050510',
    borderWidth: 1,
    borderColor: '#1a1a44',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  panel: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontFamily: fonts.retro,
    fontSize: 7,
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.retro,
    fontSize: 16,
    color: colors.neonGreen,
  },
});
