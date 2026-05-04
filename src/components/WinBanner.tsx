import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { HandResult } from '../types/game';
import { colors, fonts, glow } from '../theme/colors';

interface Props {
  result: HandResult | null;
}

export function WinBanner({ result }: Props) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result && result.payout > 0) {
      scale.setValue(0.3);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [result]);

  if (!result || result.payout === 0) {
    // Show "no win" dim text when drawn
    if (result && result.payout === 0) {
      return (
        <View style={styles.noWinContainer}>
          <Text style={styles.noWinText}>NO WIN</Text>
        </View>
      );
    }
    return <View style={styles.placeholder} />;
  }

  return (
    <Animated.View style={[styles.banner, glow.gold, { transform: [{ scale }], opacity }]}>
      <Text style={styles.handName}>{result.name.toUpperCase()}</Text>
      <Text style={styles.payout}>+{result.payout} CREDITS</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 60,
  },
  banner: {
    backgroundColor: '#1a1200',
    borderWidth: 2,
    borderColor: colors.neonGold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  handName: {
    fontFamily: fonts.retro,
    fontSize: 12,
    color: colors.neonGold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  payout: {
    fontFamily: fonts.retro,
    fontSize: 10,
    color: colors.neonGreen,
    ...glow.green,
  },
  noWinContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWinText: {
    fontFamily: fonts.retro,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 2,
  },
});
