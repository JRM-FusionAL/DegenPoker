import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card as CardType, Suit } from '../types/card';
import { colors, fonts, glow } from '../theme/colors';

interface Props {
  card: CardType | null;
  held: boolean;
  onPress?: () => void;
  animDelay?: number; // ms stagger for deal animation
  flipping?: boolean; // true while drawing this card
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  joker: '★',
};

function getSuitColor(suit: Suit): string {
  if (suit === 'hearts' || suit === 'diamonds') return colors.hearts;
  if (suit === 'joker') return colors.neonGold;
  return colors.clubs;
}

export function Card({ card, held, onPress, animDelay = 0, flipping = false }: Props) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const holdScale = useRef(new Animated.Value(1)).current;

  // Deal animation: slide up from bottom
  useEffect(() => {
    if (card) {
      slideAnim.setValue(200);
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: animDelay,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [card?.id]);

  // Flip animation when drawing
  useEffect(() => {
    if (flipping) {
      Animated.sequence([
        Animated.timing(flipAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [flipping]);

  // Hold bounce
  useEffect(() => {
    if (held) {
      Animated.spring(holdScale, { toValue: 1.05, tension: 80, friction: 5, useNativeDriver: true }).start();
    } else {
      Animated.spring(holdScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }).start();
    }
  }, [held]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg'],
  });

  if (!card) {
    return <View style={styles.cardEmpty} />;
  }

  const suitColor = getSuitColor(card.suit);
  const isJoker = card.rank === 'JOKER';

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY: slideAnim }, { scaleX: rotateY as any }, { scale: holdScale }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          held && styles.cardHeld,
          card.isShamrock && styles.cardShamrock,
          held ? glow.green : glow.cyan,
        ]}
      >
        {/* Top-left rank + suit */}
        <View style={styles.cornerTL}>
          <Text style={[styles.rankText, { color: suitColor }]}>
            {isJoker ? '★' : card.rank}
          </Text>
          <Text style={[styles.suitSmall, { color: suitColor }]}>
            {SUIT_SYMBOLS[card.suit]}
          </Text>
        </View>

        {/* Center suit */}
        <Text style={[styles.suitCenter, { color: suitColor }]}>
          {isJoker ? 'WILD' : SUIT_SYMBOLS[card.suit]}
        </Text>

        {/* Bottom-right (rotated) */}
        <View style={[styles.cornerBR]}>
          <Text style={[styles.rankText, { color: suitColor, transform: [{ rotate: '180deg' }] }]}>
            {isJoker ? '★' : card.rank}
          </Text>
          <Text style={[styles.suitSmall, { color: suitColor, transform: [{ rotate: '180deg' }] }]}>
            {SUIT_SYMBOLS[card.suit]}
          </Text>
        </View>

        {/* Shamrock badge */}
        {card.isShamrock && (
          <View style={styles.shamrockBadge}>
            <Text style={styles.shamrockText}>☘</Text>
          </View>
        )}

        {/* HOLD badge */}
        {held && (
          <View style={styles.holdBadge}>
            <Text style={styles.holdText}>HOLD</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 3,
  },
  cardEmpty: {
    width: 62,
    height: 92,
    margin: 3,
    borderRadius: 6,
    backgroundColor: '#111122',
    borderWidth: 1,
    borderColor: '#222244',
  },
  card: {
    width: 62,
    height: 92,
    borderRadius: 6,
    backgroundColor: colors.cardFace,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  cardHeld: {
    borderColor: colors.cardBorderHeld,
    borderWidth: 2,
  },
  cardShamrock: {
    borderColor: colors.cardBorderShamrock,
  },
  cornerTL: {
    position: 'absolute',
    top: 4,
    left: 5,
    alignItems: 'center',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 5,
    alignItems: 'center',
  },
  rankText: {
    fontFamily: fonts.retro,
    fontSize: 9,
    lineHeight: 11,
  },
  suitSmall: {
    fontSize: 8,
    lineHeight: 10,
  },
  suitCenter: {
    fontSize: 22,
  },
  holdBadge: {
    position: 'absolute',
    bottom: -14,
    alignSelf: 'center',
    backgroundColor: colors.holdBadge,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  holdText: {
    fontFamily: fonts.retro,
    fontSize: 6,
    color: colors.holdBadgeText,
    letterSpacing: 0.5,
  },
  shamrockBadge: {
    position: 'absolute',
    top: 2,
    right: 3,
  },
  shamrockText: {
    fontSize: 10,
    color: colors.shamrockGreen,
  },
});
