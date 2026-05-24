import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { colors, fonts } from '../theme/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

const MODE_COLORS: Record<GameMode, string> = {
  jacksOrBetter: '#3399cc',
  jokersWild: '#9944cc',
  deucesWild: '#cc2244',
  bonusPoker: '#cc6600',
  shamrocks: '#2a8a2a',
};

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function GameScreen({ navigation, route }: Props) {
  const { state, currentMode, actions } = useGameState();
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [showPayTable, setShowPayTable] = useState(false);

  useEffect(() => {
    if (route.params?.mode) {
      actions.setGameMode(route.params.mode as GameMode);
    }
  }, []);

  const handleDealDraw = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (state.phase === 'drawn') {
      if (state.credits <= 0) {
        Alert.alert('Out of Credits', 'Reset to $100?', [
          { text: 'Reset', onPress: actions.newGame },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        actions.newGame();
      }
      return;
    }

    if (state.phase === 'dealt') {
      const indices = state.heldCards.map((h, i) => (!h ? i : -1)).filter(i => i >= 0);
      setDrawnIndices(indices);
      setTimeout(() => setDrawnIndices([]), 400);
      await actions.draw();
    } else {
      if (state.credits < state.bet) {
        Alert.alert('Insufficient Credits', `You need at least ${fmt(state.bet)}.`);
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
    const next = state.bet >= 500 ? 25 : state.bet + 25;
    actions.setBet(next);
  }, [state.bet, actions]);

  const accentColor = MODE_COLORS[state.gameMode] ?? '#3399cc';
  const isJackpotActive = state.bet >= 200;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: accentColor + '44' }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ MENU</Text>
        </Pressable>
        <Text style={[styles.modeName, { color: accentColor }]}>
          {currentMode.label}
        </Text>
        <Pressable onPress={() => setShowPayTable(v => !v)} style={styles.payBtn}>
          <Text style={[styles.payBtnText, { color: accentColor }]}>
            {showPayTable ? 'CARDS' : 'PAY'}
          </Text>
        </Pressable>
      </View>

      {/* Credits */}
      <CreditDisplay credits={state.credits} bet={state.bet} highScore={state.highScore} />

      {/* Jackpot display */}
      {isJackpotActive && (
        <View style={styles.jackpotBar}>
          <Text style={styles.jackpotText}>⚡ JACKPOT: {fmt(state.jackpot)}</Text>
        </View>
      )}

      {/* Win Banner */}
      <View style={styles.bannerArea}>
        <WinBanner result={state.phase === 'drawn' ? state.lastWin : null} />
      </View>

      {/* Cards or PayTable */}
      {showPayTable ? (
        <View style={styles.payTableArea}>
          <PayTable
            paytable={currentMode.paytable}
            currentBet={state.bet}
            winningTableIndex={state.lastWin?.tableIndex ?? -1}
            jackpotValue={state.jackpot}
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
          onBetMax={actions.betMax}
          disabled={state.phase === 'dealt'}
        />
        <DealDrawButton
          phase={state.phase}
          onPress={handleDealDraw}
          disabled={state.phase === 'idle' && state.credits < state.bet}
        />
      </View>

      {/* Mini paytable strip */}
      {!showPayTable && (
        <View style={styles.miniPayStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentMode.paytable.slice(0, 6).map((entry, i) => (
              <View key={i} style={styles.miniEntry}>
                <Text style={styles.miniHand}>
                  {i === 0 && isJackpotActive ? 'JACKPOT' : entry.handName}
                </Text>
                <Text style={[styles.miniPay, { color: accentColor }]}>
                  {i === 0 && isJackpotActive
                    ? fmt(state.jackpot)
                    : fmt(entry.multipliers[0] * state.bet)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1,
  },
  backBtn: { paddingRight: 8 },
  backText: { fontFamily: fonts.mono, fontSize: 13, color: colors.textDim },
  modeName: { fontFamily: fonts.mono, fontSize: 13, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  payBtn: { paddingLeft: 8 },
  payBtnText: { fontFamily: fonts.mono, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  jackpotBar: {
    backgroundColor: '#1a1000', borderBottomWidth: 1, borderBottomColor: '#2a2000',
    paddingVertical: 5, alignItems: 'center',
  },
  jackpotText: { fontFamily: fonts.mono, fontSize: 12, fontWeight: 'bold', color: colors.gold, letterSpacing: 1 },
  bannerArea: { minHeight: 62, justifyContent: 'center', marginVertical: 4 },
  cardsArea: { flex: 1, justifyContent: 'center' },
  payTableArea: { flex: 1, marginVertical: 4 },
  controls: { alignItems: 'center', paddingBottom: 4 },
  miniPayStrip: {
    borderTopWidth: 1, borderTopColor: '#2a2a18', paddingVertical: 8, paddingHorizontal: 8,
  },
  miniEntry: { alignItems: 'center', marginRight: 20 },
  miniHand: { fontFamily: fonts.mono, fontSize: 8, color: colors.textDim, marginBottom: 2 },
  miniPay: { fontFamily: fonts.mono, fontSize: 11, fontWeight: 'bold' },
});
