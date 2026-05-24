import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SlotMode, SlotSymbol } from '../types/slot';
import { useSlotState } from '../hooks/useSlotState';
import { SlotReels } from '../components/SlotReels';
import { colors, fonts } from '../theme/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Slot'>;
  route: RouteProp<RootStackParamList, 'Slot'>;
};

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const SYM_DISPLAY: Record<SlotSymbol, string> = {
  WILD:'WILD', SCATTER:'★', SEVEN:'7', BAR:'BAR', DBAR:'2BAR', TBAR:'3BAR',
  DIAMOND:'♦', BELL:'🔔', CHERRY:'🍒', ORANGE:'🍊', LEMON:'🍋', BLANK:'—',
};

export function SlotScreen({ navigation, route }: Props) {
  const machine = route.params?.machine as SlotMode ?? 'lucky7s';
  const { state, currentMachine, actions } = useSlotState(machine);
  const [showPay, setShowPay] = useState(false);

  const isBroke = state.credits < state.bet;
  const isSpinning = state.phase === 'spinning';
  const hasFreeSpin = state.freeSpinsRemaining > 0;

  // Auto-spin during free spins
  useEffect(() => {
    if (state.phase === 'result' && hasFreeSpin) {
      const t = setTimeout(() => {
        actions.spin();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, hasFreeSpin]);

  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    if (state.phase === 'result') {
      if (state.credits <= 0) {
        Alert.alert('Out of Credits', 'Reset to $100?', [
          { text: 'Reset', onPress: actions.newGame },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }
      actions.newGame();
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    actions.spin();
  }, [isSpinning, state, actions]);

  const handleBet = useCallback((dir: 1 | -1) => {
    const next = state.bet + dir * 25;
    if (next < 25 || next > 500) return;
    actions.setBet(next);
  }, [state.bet, actions]);

  const winLines = state.lastResult?.winningPaylines.map(w => w.paylineIndex) ?? [];
  const totalWin = state.lastResult?.totalPayout ?? 0;
  const isJackpot = state.lastResult?.isJackpot ?? false;

  const spinLabel = isSpinning ? '...' : state.phase === 'result' ? 'NEXT' : hasFreeSpin ? `FREE (${state.freeSpinsRemaining})` : 'SPIN';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ MENU</Text>
        </Pressable>
        <Text style={styles.machineName}>{currentMachine.label}</Text>
        <Pressable onPress={() => setShowPay(v => !v)} style={styles.payBtn}>
          <Text style={[styles.payBtnText, { color: colors.gold }]}>
            {showPay ? 'REELS' : 'PAY'}
          </Text>
        </Pressable>
      </View>

      {/* Credits strip */}
      <View style={styles.creditsRow}>
        <View style={styles.creditBox}>
          <Text style={styles.creditLabel}>CREDITS</Text>
          <Text style={styles.creditVal}>{fmt(state.credits)}</Text>
        </View>
        <View style={styles.creditBox}>
          <Text style={styles.creditLabel}>BET</Text>
          <Text style={[styles.creditVal, { color: colors.gold }]}>{fmt(state.bet)}</Text>
        </View>
        <View style={styles.creditBox}>
          <Text style={styles.creditLabel}>WIN</Text>
          <Text style={[styles.creditVal, { color: totalWin > 0 ? '#2aaa2a' : colors.textDim }]}>
            {totalWin > 0 ? fmt(totalWin) : '—'}
          </Text>
        </View>
      </View>

      {/* Jackpot banner */}
      <View style={styles.jackpotBanner}>
        <Text style={styles.jackpotLabel}>
          {isJackpot ? '🎰  JACKPOT!  🎰' : `JACKPOT: ${fmt(state.jackpot)}`}
        </Text>
      </View>

      {/* Free spins indicator */}
      {hasFreeSpin && (
        <View style={styles.freeSpin}>
          <Text style={styles.freeSpinText}>FREE SPINS: {state.freeSpinsRemaining} × {state.freeSpinsMultiplier}×</Text>
        </View>
      )}

      {/* Main area: reels or paytable */}
      {showPay ? (
        <ScrollView style={styles.payTable} showsVerticalScrollIndicator={false}>
          <View style={styles.payHeader}>
            <Text style={styles.payCol}>HAND</Text>
            <Text style={styles.payColR}>3×</Text>
            <Text style={styles.payColR}>4×</Text>
            <Text style={styles.payColR}>5×</Text>
          </View>
          {currentMachine.paytable.filter(e => e.count3 > 0 || e.count4 > 0 || e.count5 > 0).map(e => (
            <View key={e.symbol} style={styles.payRow}>
              <Text style={styles.payCol}>{SYM_DISPLAY[e.symbol]}</Text>
              <Text style={styles.payColR}>{e.count3 ? fmt(e.count3 * state.bet) : '—'}</Text>
              <Text style={styles.payColR}>{e.count4 ? fmt(e.count4 * state.bet) : '—'}</Text>
              <Text style={[styles.payColR, e.isJackpotSlot && styles.jackpotText]}>
                {e.isJackpotSlot && state.bet >= 200 ? 'JACKPOT' : e.count5 ? fmt(e.count5 * state.bet) : '—'}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.reelsArea}>
          <SlotReels
            grid={state.grid}
            reelCount={currentMachine.reelCount}
            reelStopped={state.reelStopped}
            winningPaylines={winLines}
            paylines={currentMachine.paylines}
          />
          {/* Win flash */}
          {state.phase === 'result' && totalWin > 0 && (
            <View style={styles.winFlash}>
              <Text style={styles.winFlashText}>
                {isJackpot ? '🎰 JACKPOT! 🎰' : `WIN  ${fmt(totalWin)}`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Bet controls */}
        <View style={styles.betRow}>
          <Pressable
            style={[styles.betBtn, (isSpinning || hasFreeSpin) && styles.btnDisabled]}
            onPress={() => handleBet(-1)}
            disabled={isSpinning || hasFreeSpin}
          >
            <Text style={styles.betBtnText}>－</Text>
          </Pressable>

          <View style={styles.betDisplay}>
            <Text style={styles.betAmt}>{fmt(state.bet)}</Text>
            {state.bet >= 200 && <Text style={styles.jackpotTag}>⚡ JACKPOT</Text>}
          </View>

          <Pressable
            style={[styles.betBtn, (isSpinning || hasFreeSpin) && styles.btnDisabled]}
            onPress={() => handleBet(1)}
            disabled={isSpinning || hasFreeSpin}
          >
            <Text style={styles.betBtnText}>＋</Text>
          </Pressable>

          <Pressable
            style={[styles.maxBtn, (isSpinning || hasFreeSpin) && styles.btnDisabled]}
            onPress={actions.betMax}
            disabled={isSpinning || hasFreeSpin}
          >
            <Text style={styles.maxBtnText}>MAX</Text>
          </Pressable>
        </View>

        {/* Spin button */}
        <Pressable
          style={[
            styles.spinBtn,
            isSpinning && styles.spinBtnDisabled,
            state.phase === 'result' && styles.spinBtnNext,
            isBroke && styles.spinBtnDisabled,
          ]}
          onPress={handleSpin}
          disabled={isSpinning || isBroke}
        >
          <Text style={styles.spinLabel}>{spinLabel}</Text>
        </Pressable>

        {isBroke && <Text style={styles.brokeText}>INSUFFICIENT FUNDS</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#2a2a18',
  },
  backBtn: { paddingRight: 8 },
  backText: { fontFamily: fonts.mono, fontSize: 13, color: colors.textDim },
  machineName: { flex: 1, fontFamily: fonts.mono, fontSize: 13, fontWeight: 'bold', color: colors.gold, textAlign: 'center' },
  payBtn: { paddingLeft: 8 },
  payBtnText: { fontFamily: fonts.mono, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  creditsRow: {
    flexDirection: 'row', backgroundColor: '#080808',
    borderBottomWidth: 1, borderBottomColor: '#2a2a18', paddingVertical: 8,
  },
  creditBox: { flex: 1, alignItems: 'center' },
  creditLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.textDim, letterSpacing: 1 },
  creditVal: { fontFamily: fonts.mono, fontSize: 18, fontWeight: 'bold', color: '#e8e8e8' },
  jackpotBanner: {
    backgroundColor: '#1a1000', borderBottomWidth: 1, borderColor: '#2a2a18',
    paddingVertical: 6, alignItems: 'center',
  },
  jackpotLabel: { fontFamily: fonts.mono, fontSize: 13, fontWeight: 'bold', color: colors.gold, letterSpacing: 1 },
  freeSpin: {
    backgroundColor: '#1a004a', paddingVertical: 4, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#4422aa',
  },
  freeSpinText: { fontFamily: fonts.mono, fontSize: 11, color: '#bb88ff', fontWeight: 'bold' },
  reelsArea: { flex: 1, justifyContent: 'center', position: 'relative' },
  payTable: { flex: 1, backgroundColor: '#080808', marginHorizontal: 8, marginVertical: 4, borderRadius: 6 },
  payHeader: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a18',
    paddingVertical: 6, backgroundColor: '#111108',
  },
  payRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1a1a10' },
  payCol: { flex: 1, fontFamily: fonts.mono, fontSize: 11, color: '#c8c0a8', paddingLeft: 10 },
  payColR: { width: 72, fontFamily: fonts.mono, fontSize: 10, color: '#887860', textAlign: 'right', paddingRight: 10 },
  jackpotText: { color: colors.gold, fontWeight: 'bold' },
  winFlash: {
    position: 'absolute', left: 8, right: 8, alignItems: 'center', justifyContent: 'center',
    bottom: 12, backgroundColor: '#1a1000cc',
    borderWidth: 2, borderColor: colors.gold, borderRadius: 8, paddingVertical: 10,
  },
  winFlashText: { fontFamily: fonts.mono, fontSize: 18, fontWeight: 'bold', color: colors.gold, letterSpacing: 2 },
  controls: { paddingBottom: 8, alignItems: 'center' },
  betRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6,
  },
  betBtn: {
    width: 40, height: 40, borderRadius: 6, backgroundColor: '#0e0e5a',
    borderWidth: 1.5, borderColor: '#3355bb', justifyContent: 'center', alignItems: 'center',
  },
  betBtnText: { fontFamily: fonts.mono, fontSize: 20, color: colors.textPrimary, fontWeight: 'bold' },
  betDisplay: { alignItems: 'center', minWidth: 90 },
  betAmt: { fontFamily: fonts.mono, fontSize: 20, fontWeight: 'bold', color: colors.gold },
  jackpotTag: { fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 1 },
  maxBtn: {
    paddingHorizontal: 12, height: 40, borderRadius: 6, backgroundColor: '#5a2200',
    borderWidth: 1.5, borderColor: '#aa5500', justifyContent: 'center',
  },
  maxBtnText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textPrimary, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.35 },
  spinBtn: {
    paddingVertical: 16, paddingHorizontal: 60, borderRadius: 8,
    backgroundColor: '#8b0000', borderWidth: 2, borderColor: '#cc2222',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6,
  },
  spinBtnNext: { backgroundColor: '#1a4a1a', borderColor: '#2aaa2a' },
  spinBtnDisabled: { opacity: 0.35, backgroundColor: '#222' },
  spinLabel: { fontFamily: fonts.mono, fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, letterSpacing: 4 },
  brokeText: { fontFamily: fonts.mono, fontSize: 10, color: '#cc2222', marginTop: 4 },
});
