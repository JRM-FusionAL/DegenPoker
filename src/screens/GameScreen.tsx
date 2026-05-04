import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { GameMode } from '../types/game';
import { useGameState, GAME_MODES } from '../hooks/useGameState';
import { CardHand } from '../components/CardHand';
import { CreditDisplay } from '../components/CreditDisplay';
import { BetControls } from '../components/BetControls';
import { DealDrawButton } from '../components/DealDrawButton';
import { WinBanner } from '../components/WinBanner';
import { PayTable } from '../components/PayTable';
import { colors, fonts, glow } from '../theme/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

export function GameScreen({ navigation, route }: Props) {
  const { state, currentMode, actions } = useGameState();
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [showPayTable, setShowPayTable] = useState(false);

  // Set mode from route param on mount
  useEffect(() => {
    if (route.params?.mode) {
      actions.setGameMode(route.params.mode as GameMode);
    }
  }, []);

  const handleDealDraw = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (state.phase === 'drawn') {
      if (state.credits <= 0) {
        Alert.alert(
          'BROKE!',
          'You ran out of credits. Reset to 1,000?',
          [
            { text: 'Reset', onPress: actions.newGame },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        actions.newGame();
      }
      return;
    }

    if (state.phase === 'dealt') {
      // Mark which cards will be drawn for flip animation
      const indices = state.heldCards
        .map((h, i) => (!h ? i : -1))
        .filter(i => i >= 0);
      setDrawnIndices(indices);
      setTimeout(() => setDrawnIndices([]), 400);
      actions.draw();
    } else {
      if (state.credits < state.bet) {
        Alert.alert('Not enough credits', `You need at least ${state.bet} credits to bet.`);
        return;
      }
      actions.deal();
    }
  }, [state, actions]);

  const handleToggleHold = useCallback(async (index: number) => {
    await Haptics.selectionAsync();
    actions.toggleHold(index);
  }, [actions]);

  const handleBetOne = useCallback(() => {
    const next = state.bet >= 5 ? 1 : state.bet + 1;
    actions.setBet(next);
  }, [state.bet, actions]);

  const handleBetMax = useCallback(() => {
    actions.betMax();
  }, [actions]);

  const accentColor = {
    jacksOrBetter: colors.neonCyan,
    jokersWild: colors.neonGold,
    deucesWild: colors.neonPink,
    bonusPoker: colors.neonOrange,
    shamrocks: colors.shamrockGreen,
  }[state.gameMode] ?? colors.neonCyan;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>◀ MODES</Text>
        </Pressable>
        <Text style={[styles.modeName, { color: accentColor }]}>
          {currentMode.label.toUpperCase()}
        </Text>
        <Pressable onPress={() => setShowPayTable(v => !v)} style={styles.payBtn}>
          <Text style={[styles.payBtnText, { color: accentColor }]}>
            {showPayTable ? 'CARDS' : 'PAY'}
          </Text>
        </Pressable>
      </View>

      {/* Credits */}
      <CreditDisplay
        credits={state.credits}
        bet={state.bet}
        highScore={state.highScore}
      />

      {/* Win Banner */}
      <View style={styles.bannerArea}>
        <WinBanner result={state.phase === 'drawn' ? state.lastWin : null} />
      </View>

      {/* Cards or PayTable toggle */}
      {showPayTable ? (
        <View style={styles.payTableArea}>
          <PayTable
            paytable={currentMode.paytable}
            currentBet={state.bet}
            winningTableIndex={state.lastWin?.tableIndex ?? -1}
          />
        </View>
      ) : (
        <View style={styles.cardsArea}>
          <CardHand
            hand={state.hand}
            heldCards={state.heldCards}
            onToggleHold={handleToggleHold}
            canHold={state.phase === 'dealt'}
            drawnIndices={drawnIndices}
          />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <BetControls
          bet={state.bet}
          onBetOne={handleBetOne}
          onBetMax={handleBetMax}
          disabled={state.phase === 'dealt'}
        />
        <DealDrawButton
          phase={state.phase}
          onPress={handleDealDraw}
          disabled={state.phase === 'idle' && state.credits < state.bet}
        />
      </View>

      {/* Tiny paytable strip always visible at bottom */}
      {!showPayTable && (
        <View style={styles.miniPayStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentMode.paytable.slice(0, 5).map((entry, i) => (
              <View key={i} style={styles.miniEntry}>
                <Text style={styles.miniHand}>{entry.handName}</Text>
                <Text style={styles.miniPay}>{entry.multipliers[state.bet - 1]}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111133',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontFamily: fonts.retro,
    fontSize: 7,
    color: colors.textDim,
  },
  modeName: {
    fontFamily: fonts.retro,
    fontSize: 9,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  payBtn: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  payBtnText: {
    fontFamily: fonts.retro,
    fontSize: 7,
    letterSpacing: 1,
  },
  bannerArea: {
    minHeight: 62,
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardsArea: {
    flex: 1,
    justifyContent: 'center',
  },
  payTableArea: {
    flex: 1,
    marginVertical: 4,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  miniPayStrip: {
    borderTopWidth: 1,
    borderTopColor: '#111133',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  miniEntry: {
    alignItems: 'center',
    marginRight: 16,
  },
  miniHand: {
    fontFamily: fonts.retro,
    fontSize: 5,
    color: colors.textDim,
    marginBottom: 2,
  },
  miniPay: {
    fontFamily: fonts.retro,
    fontSize: 8,
    color: colors.neonGold,
  },
});
