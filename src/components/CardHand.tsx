import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card as CardType } from '../types/card';
import { Card } from './Card';

interface Props {
  hand: CardType[];
  heldCards: boolean[];
  onToggleHold: (index: number) => void;
  canHold: boolean;
  drawnIndices?: number[]; // indices currently being drawn (for flip animation)
}

export function CardHand({ hand, heldCards, onToggleHold, canHold, drawnIndices = [] }: Props) {
  const cards = hand.length === 5 ? hand : Array(5).fill(null);

  return (
    <View style={styles.container}>
      {cards.map((card, i) => (
        <Card
          key={card?.id ?? `empty-${i}`}
          card={card}
          held={heldCards[i] ?? false}
          onPress={canHold ? () => onToggleHold(i) : undefined}
          animDelay={i * 80}
          flipping={drawnIndices.includes(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 20, // space for HOLD badges
    paddingTop: 8,
  },
});
