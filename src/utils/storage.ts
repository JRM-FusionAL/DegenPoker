import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMode } from '../types/game';

const KEYS = {
  credits:   'dp_credits',
  highScore: 'dp_high_score',
  lastMode:  'dp_last_mode',
  jackpot:   'dp_jackpot',
};

export const STARTING_CENTS = 10000;   // $100.00
export const JACKPOT_BASE   = 100000;  // $1000.00

// Keep legacy alias used in older code
export const STARTING_CREDITS = STARTING_CENTS;

// ─── Credits (stored as integer cents) ───────────────────────────────────────
export async function loadCredits(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.credits);
  return val !== null ? parseInt(val, 10) : STARTING_CENTS;
}

export async function saveCredits(cents: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.credits, String(Math.round(cents)));
}

// ─── High score ───────────────────────────────────────────────────────────────
export async function loadHighScore(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.highScore);
  return val !== null ? parseInt(val, 10) : STARTING_CENTS;
}

export async function saveHighScore(cents: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.highScore, String(Math.round(cents)));
}

// ─── Last mode ────────────────────────────────────────────────────────────────
export async function loadLastMode(): Promise<GameMode> {
  const val = await AsyncStorage.getItem(KEYS.lastMode);
  return (val as GameMode) ?? 'jacksOrBetter';
}

export async function saveLastMode(mode: GameMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastMode, mode);
}

// ─── Progressive jackpot ─────────────────────────────────────────────────────
export async function loadJackpot(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.jackpot);
  return val !== null ? parseInt(val, 10) : JACKPOT_BASE;
}

export async function saveJackpot(cents: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.jackpot, String(Math.round(cents)));
}

/** Adds 2% of betCents to the jackpot, saves, and returns the new total. */
export async function contributeToJackpot(betCents: number): Promise<number> {
  const current = await loadJackpot();
  const contribution = Math.ceil(betCents * 0.02);
  const next = current + contribution;
  await saveJackpot(next);
  return next;
}
