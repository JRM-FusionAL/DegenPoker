import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { HandResult } from '../types/game';
import { colors, fonts } from '../theme/colors';

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
    if (result && result.payout === 0) {
      return (
        <View style={styles.noWinContainer}>
          <Text style={styles.noWinText}>— NO WIN —</Text>
        </View>
      );
    }
    return <View style={styles.placeholder} />;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Text style={styles.handName}>{result.name.toUpperCase()}</Text>
      <Text style={styles.payout}>WIN  {result.payout}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 62,
  },
  banner: {
    backgroundColor: '#1a1000',
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  handName: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  payout: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e8e8e8',
  },
  noWinContainer: {
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWinText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    letterSpacing: 2,
  },
});
