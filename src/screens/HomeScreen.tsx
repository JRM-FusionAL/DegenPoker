import React from 'react';
import {
  Dimensions, FlatList, Pressable, StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { GameMode } from '../types/game';
import { SlotMode } from '../types/slot';
import { GAME_MODES } from '../hooks/useGameState';
import { SLOT_MACHINES } from '../game/slots/slotMachine';
import { colors, fonts } from '../theme/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type TileItem =
  | { kind: 'poker'; id: GameMode; label: string; description: string; icon: string; color: string }
  | { kind: 'slot';  id: SlotMode; label: string; description: string; icon: string; color: string };

const POKER_ICONS: Record<GameMode, string> = {
  jacksOrBetter: '♠', jokersWild: '★', deucesWild: '2',
  bonusPoker: '4', shamrocks: '☘',
};
const POKER_COLORS: Record<GameMode, string> = {
  jacksOrBetter: '#3399cc', jokersWild: '#9944cc', deucesWild: '#cc2244',
  bonusPoker: '#cc6600', shamrocks: '#2a8a2a',
};
const SLOT_ICONS: Record<SlotMode, string> = {
  lucky7s: '7', spinWin: '🎰', doubleDiamond: '♦',
};
const SLOT_COLORS: Record<SlotMode, string> = {
  lucky7s: '#cc2222', spinWin: '#9944cc', doubleDiamond: '#00aacc',
};

const TILES: TileItem[] = [
  ...GAME_MODES.map(m => ({
    kind: 'poker' as const,
    id: m.id,
    label: m.label,
    description: m.description,
    icon: POKER_ICONS[m.id],
    color: POKER_COLORS[m.id],
  })),
  ...SLOT_MACHINES.map(m => ({
    kind: 'slot' as const,
    id: m.id,
    label: m.label,
    description: m.description,
    icon: SLOT_ICONS[m.id],
    color: SLOT_COLORS[m.id],
  })),
];

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_W - 36) / 2;   // 2 columns with 12px margins + 12px gap

export function HomeScreen({ navigation }: Props) {
  const handleTile = (item: TileItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.kind === 'poker') {
      navigation.navigate('Game', { mode: item.id });
    } else {
      navigation.navigate('Slot', { machine: item.id });
    }
  };

  const handleWallet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // SOL wallet connection — requires Solana Mobile Wallet Adapter
    // Integration pending
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.suitRow}>
          {['♠','♥','♦','♣'].map((s, i) => (
            <Text key={i} style={[styles.suit, i % 2 === 1 && styles.suitRed]}>{s}</Text>
          ))}
        </View>
        <Text style={styles.title}>DEGEN</Text>
        <Text style={styles.titleSub}>POKER</Text>
        <Text style={styles.subtitle}>VIDEO GAMING</Text>
        <View style={styles.suitRow}>
          {['♣','♦','♥','♠'].map((s, i) => (
            <Text key={i} style={[styles.suit, i % 2 === 1 && styles.suitRed]}>{s}</Text>
          ))}
        </View>
      </View>

      {/* SOL wallet stub */}
      <Pressable style={styles.walletBtn} onPress={handleWallet}>
        <Text style={styles.walletText}>◎  Connect SOL Wallet</Text>
        <Text style={styles.walletSub}>Fund credits with Solana</Text>
      </Pressable>

      {/* Game tile grid */}
      <FlatList
        data={TILES}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.tile,
              { borderColor: item.color, width: TILE_SIZE, height: TILE_SIZE },
              pressed && styles.tilePressed,
            ]}
            onPress={() => handleTile(item)}
          >
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
              <Text style={[styles.icon, { color: item.color }]}>{item.icon}</Text>
            </View>

            {/* Info */}
            <Text style={[styles.tileName, { color: item.color }]} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.tileDesc} numberOfLines={2}>{item.description}</Text>

            {/* Type badge */}
            <View style={[styles.badge, { backgroundColor: item.color + '33' }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>
                {item.kind === 'poker' ? 'POKER' : 'SLOTS'}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center', paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a18',
  },
  suitRow: { flexDirection: 'row', gap: 14, marginVertical: 4 },
  suit: { fontSize: 16, color: '#333333', opacity: 0.7 },
  suitRed: { color: '#cc0000', opacity: 0.7 },
  title: { fontFamily: fonts.retro, fontSize: 26, color: colors.gold, letterSpacing: 6 },
  titleSub: { fontFamily: fonts.retro, fontSize: 22, color: '#e8e8e8', letterSpacing: 5, marginTop: -2 },
  subtitle: { fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, letterSpacing: 5, marginTop: 4 },
  walletBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#9945ff44',
    marginHorizontal: 12, marginVertical: 8, borderRadius: 6,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  walletText: { fontFamily: fonts.mono, fontSize: 12, color: '#9945ff', fontWeight: 'bold' },
  walletSub: { fontFamily: fonts.mono, fontSize: 9, color: colors.textDim },
  grid: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12 },
  row: { gap: 12, marginBottom: 12 },
  tile: {
    backgroundColor: '#111111', borderWidth: 1.5, borderRadius: 10,
    padding: 12, justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4,
  },
  tilePressed: { opacity: 0.7, backgroundColor: '#1a1a1a' },
  iconBox: {
    width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  icon: { fontSize: 28, fontWeight: 'bold' },
  tileName: { fontFamily: fonts.mono, fontSize: 12, fontWeight: 'bold', letterSpacing: 0.3, marginBottom: 2 },
  tileDesc: { fontFamily: fonts.mono, fontSize: 9, color: colors.textDim, lineHeight: 13, flex: 1 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6,
  },
  badgeText: { fontFamily: fonts.mono, fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
});
