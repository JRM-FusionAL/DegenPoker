import { useCallback, useEffect, useReducer, useRef } from 'react';
import { SlotMode, SlotResult, SlotState, SlotSymbol } from '../types/slot';
import { getSlotMachine, spinReels } from '../game/slots/slotMachine';
import {
  loadCredits, saveCredits,
  loadJackpot, saveJackpot, contributeToJackpot,
  loadHighScore, saveHighScore,
  STARTING_CENTS, JACKPOT_BASE,
} from '../utils/storage';

const INITIAL_STATE: SlotState = {
  credits: STARTING_CENTS,
  highScore: STARTING_CENTS,
  bet: 25,
  jackpot: JACKPOT_BASE,
  grid: [],
  reelStopped: [true, true, true, true, true],
  lastResult: null,
  phase: 'idle',
  freeSpinsRemaining: 0,
  freeSpinsMultiplier: 1,
};

type Action =
  | { type: 'LOAD'; credits: number; highScore: number; jackpot: number }
  | { type: 'SET_BET'; bet: number }
  | { type: 'SPIN_START'; result: SlotResult; reelCount: number }
  | { type: 'REEL_STOP'; index: number }
  | { type: 'SPIN_DONE'; newCredits: number; newHighScore: number; newJackpot: number; freeSpins: number }
  | { type: 'NEW_GAME' }
  | { type: 'RESET_CREDITS' };

function reducer(state: SlotState, action: Action): SlotState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, credits: action.credits, highScore: action.highScore, jackpot: action.jackpot };

    case 'SET_BET':
      if (state.phase !== 'idle') return state;
      return { ...state, bet: action.bet };

    case 'SPIN_START':
      return {
        ...state,
        phase: 'spinning',
        lastResult: action.result,
        grid: action.result.grid,
        reelStopped: Array(action.reelCount).fill(false),
        credits: state.credits - state.bet,
      };

    case 'REEL_STOP': {
      const updated = [...state.reelStopped];
      updated[action.index] = true;
      return { ...state, reelStopped: updated };
    }

    case 'SPIN_DONE':
      return {
        ...state,
        phase: 'result',
        credits: action.newCredits,
        highScore: action.newHighScore,
        jackpot: action.newJackpot,
        freeSpinsRemaining: action.freeSpins > 0
          ? state.freeSpinsRemaining + action.freeSpins
          : Math.max(0, state.freeSpinsRemaining - 1),
        freeSpinsMultiplier: action.freeSpins > 0 ? 2 : state.freeSpinsMultiplier,
      };

    case 'NEW_GAME':
      return {
        ...state,
        phase: 'idle',
        lastResult: null,
        grid: [],
        reelStopped: [true, true, true, true, true],
      };

    case 'RESET_CREDITS':
      return { ...state, credits: STARTING_CENTS, phase: 'idle', lastResult: null, grid: [] };

    default:
      return state;
  }
}

export function useSlotState(machine: SlotMode) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const pendingResult = useRef<SlotResult | null>(null);
  const currentMachine = getSlotMachine(machine);

  useEffect(() => {
    (async () => {
      const [credits, highScore, jackpot] = await Promise.all([
        loadCredits(), loadHighScore(), loadJackpot(),
      ]);
      dispatch({ type: 'LOAD', credits, highScore, jackpot });
    })();
  }, []);

  const setBet = useCallback((bet: number) => {
    dispatch({ type: 'SET_BET', bet });
  }, []);

  const betMax = useCallback(() => {
    dispatch({ type: 'SET_BET', bet: 500 });
  }, []);

  const stopReel = useCallback((index: number) => {
    dispatch({ type: 'REEL_STOP', index });
  }, []);

  const spin = useCallback(async () => {
    if (state.phase === 'spinning') return;
    if (state.credits < state.bet) return;

    const result = spinReels(currentMachine, state.bet, state.jackpot);
    pendingResult.current = result;

    dispatch({ type: 'SPIN_START', result, reelCount: currentMachine.reelCount });

    // Stop reels sequentially
    const { reelCount } = currentMachine;
    for (let i = 0; i < reelCount; i++) {
      await delay((i + 1) * 380 + 800);
      dispatch({ type: 'REEL_STOP', index: i });
    }

    // Finalize
    const mult = state.freeSpinsRemaining > 0 ? state.freeSpinsMultiplier : 1;
    const rawPayout = result.isJackpot ? state.jackpot : result.totalPayout;
    const scaledPayout = rawPayout * mult;

    let newJackpot = state.jackpot;
    if (result.isJackpot) {
      newJackpot = JACKPOT_BASE;
      await saveJackpot(JACKPOT_BASE);
    } else {
      newJackpot = await contributeToJackpot(state.bet);
    }

    const newCredits = state.credits - state.bet + scaledPayout;
    const newHighScore = Math.max(state.highScore, newCredits);

    dispatch({
      type: 'SPIN_DONE',
      newCredits,
      newHighScore,
      newJackpot,
      freeSpins: result.freeSpinsAwarded,
    });

    await saveCredits(newCredits);
    if (newCredits > state.highScore) await saveHighScore(newCredits);
  }, [state, currentMachine]);

  const newGame = useCallback(() => {
    if (state.credits <= 0) {
      dispatch({ type: 'RESET_CREDITS' });
      saveCredits(STARTING_CENTS);
    } else {
      dispatch({ type: 'NEW_GAME' });
    }
  }, [state.credits]);

  return {
    state,
    currentMachine,
    actions: { setBet, betMax, spin, stopReel, newGame },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
