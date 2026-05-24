import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card as CardType, Suit } from '../types/card';
import { colors, fonts } from '../theme/colors';

interface Props {
  card: CardType | null;
  held: boolean;
  onPress?: () => void;
  animDelay?: number;
  flipping?: boolean;
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
  if (suit === 'joker') return '#8a6000';
  return colors.clubs;
}

export function Card({ card, held, onPress, animDelay = 0, flipping = false }: Props) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const holdScale = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (flipping) {
      Animated.sequence([
        Animated.timing(flipAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [flipping]);

  useEffect(() => {
    Animated.spring(holdScale, {
      toValue: held ? 1.05 : 1,
      tension: 80,
      friction: 5,
      useNativeDriver: true,
    }).start();
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
  const rankLabel = isJoker ? 'JO' : card.rank;
  const cardStyle = isJoker ? styles.cardJoker : styles.card;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY: slideAnim }, { rotateY }, { scale: holdScale }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          cardStyle,
          held && styles.cardHeld,
          card.isShamrock && styles.cardShamrock,
        ]}
      >
        {/* Top-left corner */}
        <View style={styles.cornerTL}>
          <Text style={[styles.rankText, { color: suitColor }]}>{rankLabel}</Text>
          <Text style={[styles.suitSmall, { color: suitColor }]}>
            {SUIT_SYMBOLS[card.suit]}
          </Text>
        </View>

        {/* Center suit */}
        <Text style={[styles.suitCenter, { color: isJoker ? '#8a6000' : suitColor }]}>
          {isJoker ? '★' : SUIT_SYMBOLS[card.suit]}
        </Text>

        {/* Bottom-right (rotated) */}
        <View style={styles.cornerBR}>
          <Text style={[styles.rankText, { color: suitColor, transform: [{ rotate: '180deg' }] }]}>
            {rankLabel}
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

        {/* HELD indicator */}
        {held && (
          <View style={styles.holdBadge}>
            <Text style={styles.holdText}>HELD</Text>
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
    width: 64,
    height: 96,
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#0d2a0d',
    borderWidth: 1,
    borderColor: '#1a3a1a',
  },
  card: {
    width: 64,
    height: 96,
    borderRadius: 8,
    backgroundColor: colors.cardFace,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  cardJoker: {
    width: 64,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#fffff0',
    borderWidth: 1.5,
    borderColor: '#c9a84c',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeld: {
    borderColor: colors.cardBorderHeld,
    borderWidth: 2.5,
    shadowColor: '#2aaa2a',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  cardShamrock: {
    borderColor: colors.cardBorderShamrock,
  },
  cornerTL: {
    position: 'absolute',
    top: 5,
    left: 6,
    alignItems: 'center',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    alignItems: 'center',
  },
  rankText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 13,
  },
  suitSmall: {
    fontSize: 10,
    lineHeight: 12,
  },
  suitCenter: {
    fontSize: 28,
  },
  holdBadge: {
    position: 'absolute',
    bottom: -18,
    alignSelf: 'center',
    backgroundColor: colors.holdBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  holdText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.holdBadgeText,
    letterSpacing: 1,
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
