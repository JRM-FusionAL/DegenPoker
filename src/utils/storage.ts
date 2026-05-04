import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMode } from '../types/game';

const KEYS = {
  credits: 'poker_credits',
  highScore: 'poker_high_score',
  lastMode: 'poker_last_mode',
};

export const STARTING_CREDITS = 1000;

export async function loadCredits(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.credits);
  return val !== null ? parseInt(val, 10) : STARTING_CREDITS;
}

export async function saveCredits(credits: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.credits, String(credits));
}

export async function loadHighScore(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.highScore);
  return val !== null ? parseInt(val, 10) : STARTING_CREDITS;
}

export async function saveHighScore(score: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.highScore, String(score));
}

export async function loadLastMode(): Promise<GameMode> {
  const val = await AsyncStorage.getItem(KEYS.lastMode);
  return (val as GameMode) ?? 'jacksOrBetter';
}

export async function saveLastMode(mode: GameMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastMode, mode);
}
