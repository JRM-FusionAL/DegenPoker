import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameMode } from '../types/game';
import { GAME_MODES } from '../hooks/useGameState';
import { colors, fonts, glow } from '../theme/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const MODE_ICONS: Record<GameMode, string> = {
  jacksOrBetter: '♠',
  jokersWild: '★',
  deucesWild: '2',
  bonusPoker: '4',
  shamrocks: '☘',
};

const MODE_COLORS: Record<GameMode, string> = {
  jacksOrBetter: colors.neonCyan,
  jokersWild: colors.neonGold,
  deucesWild: colors.neonPink,
  bonusPoker: colors.neonOrange,
  shamrocks: colors.shamrockGreen,
};

export function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={[styles.title, glow.cyan]}>DEGEN</Text>
        <Text style={[styles.titleAccent, glow.gold]}>POKER</Text>
        <Text style={styles.subtitle}>VIDEO POKER</Text>
      </View>

      <FlatList
        data={GAME_MODES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const accentColor = MODE_COLORS[item.id];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.modeCard,
                { borderColor: accentColor },
                pressed && styles.modeCardPressed,
              ]}
              onPress={() => navigation.navigate('Game', { mode: item.id })}
            >
              <Text style={[styles.modeIcon, { color: accentColor }]}>
                {MODE_ICONS[item.id]}
              </Text>
              <View style={styles.modeInfo}>
                <Text style={[styles.modeName, { color: accentColor }]}>{item.label.toUpperCase()}</Text>
                <Text style={styles.modeDesc}>{item.description}</Text>
              </View>
              <Text style={[styles.modeArrow, { color: accentColor }]}>▶</Text>
            </Pressable>
          );
        }}
      />

      <Text style={styles.footer}>TAP A MODE TO PLAY</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.retro,
    fontSize: 32,
    color: colors.neonCyan,
    letterSpacing: 4,
  },
  titleAccent: {
    fontFamily: fonts.retro,
    fontSize: 28,
    color: colors.neonGold,
    letterSpacing: 3,
    marginTop: -4,
  },
  subtitle: {
    fontFamily: fonts.retro,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 4,
    marginTop: 8,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    gap: 14,
  },
  modeCardPressed: {
    opacity: 0.75,
  },
  modeIcon: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontFamily: fonts.retro,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  modeDesc: {
    fontFamily: fonts.retro,
    fontSize: 6,
    color: colors.textDim,
    lineHeight: 11,
  },
  modeArrow: {
    fontSize: 16,
  },
  footer: {
    fontFamily: fonts.retro,
    fontSize: 7,
    color: colors.textDim,
    textAlign: 'center',
    letterSpacing: 2,
    paddingBottom: 16,
  },
});
