import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

interface Props {
  credits: number;  // cents
  bet: number;      // cents
  highScore: number; // cents
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CreditDisplay({ credits, bet, highScore }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.label}>CREDITS</Text>
        <Text style={styles.valueCredits}>{fmt(credits)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.panel}>
        <Text style={styles.label}>BET</Text>
        <Text style={styles.valueBet}>{fmt(bet)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.panel}>
        <Text style={styles.label}>BEST</Text>
        <Text style={styles.valueHigh}>{fmt(highScore)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#2a2a18',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  panel: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 36, backgroundColor: '#2a2a18' },
  label: {
    fontFamily: fonts.mono, fontSize: 9, color: colors.textDim, letterSpacing: 1, marginBottom: 4,
  },
  valueCredits: {
    fontFamily: fonts.mono, fontSize: 18, fontWeight: 'bold', color: '#e8e8e8',
  },
  valueBet: {
    fontFamily: fonts.mono, fontSize: 18, fontWeight: 'bold', color: colors.gold,
  },
  valueHigh: {
    fontFamily: fonts.mono, fontSize: 18, fontWeight: 'bold', color: colors.neonCyan,
  },
});
