import { useCallback, useEffect, useReducer } from 'react';
import { Card } from '../types/card';
import { GameMode, GamePhase, GameState, HandResult } from '../types/game';
import { createDeck, dealCards, shuffle, applyShamrocks } from '../utils/deck';
import {
  loadCredits, loadHighScore, loadLastMode, loadJackpot,
  saveCredits, saveHighScore, saveLastMode, saveJackpot, contributeToJackpot,
  STARTING_CENTS, JACKPOT_BASE,
} from '../utils/storage';
import * as JacksBetter from '../game/modes/jacksOrBetter';
import * as JokersWild from '../game/modes/jokersWild';
import * as DeucesWild from '../game/modes/deucesWild';
import * as BonusPoker from '../game/modes/bonusPoker';
import * as Shamrocks from '../game/modes/shamrocks';
import { GameModeDefinition } from '../types/game';

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'jacksOrBetter',
    label: 'Jacks or Better',
    description: 'Classic video poker. Pairs of Jacks or higher win.',
    paytable: JacksBetter.PAYTABLE,
    usesJoker: false,
    evaluate: JacksBetter.evaluate,
  },
  {
    id: 'jokersWild',
    label: 'Jokers Wild',
    description: 'Joker is wild! Minimum winning hand: Two Pair.',
    paytable: JokersWild.PAYTABLE,
    usesJoker: true,
    evaluate: JokersWild.evaluate,
  },
  {
    id: 'deucesWild',
    label: 'Deuces Wild',
    description: 'All 2s are wild. Minimum winning hand: Three of a Kind.',
    paytable: DeucesWild.PAYTABLE,
    usesJoker: false,
    evaluate: DeucesWild.evaluate,
  },
  {
    id: 'bonusPoker',
    label: 'Double Bonus',
    description: 'Enhanced payouts for Four of a Kind hands.',
    paytable: BonusPoker.PAYTABLE,
    usesJoker: false,
    evaluate: BonusPoker.evaluate,
  },
  {
    id: 'shamrocks',
    label: 'Shamrocks',
    description: '☘ cards auto-hold and double your payout!',
    paytable: Shamrocks.PAYTABLE,
    usesJoker: false,
    evaluate: Shamrocks.evaluate,
  },
];

const INITIAL_STATE: GameState = {
  credits: STARTING_CENTS,
  highScore: STARTING_CENTS,
  bet: 25,         // $0.25
  jackpot: JACKPOT_BASE,
  hand: [],
  heldCards: [false, false, false, false, false],
  phase: 'idle',
  lastWin: null,
  gameMode: 'jacksOrBetter',
};

type Action =
  | { type: 'LOAD'; credits: number; highScore: number; jackpot: number; gameMode: GameMode }
  | { type: 'SET_BET'; bet: number }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'DEAL'; hand: Card[] }
  | { type: 'TOGGLE_HOLD'; index: number }
  | { type: 'HOLD_ALL_SHAMROCKS' }
  | { type: 'DRAW'; hand: Card[]; result: HandResult; newCredits: number; newHighScore: number; newJackpot: number }
  | { type: 'NEW_GAME' }
  | { type: 'RESET_CREDITS' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD':
      // gameMode excluded — async loadLastMode() races with setGameMode(route param) and overwrites it
      return { ...state, credits: action.credits, highScore: action.highScore, jackpot: action.jackpot };

    case 'SET_BET':
      if (state.phase !== 'idle') return state;
      return { ...state, bet: action.bet };

    case 'SET_MODE':
      if (state.phase !== 'idle') return state;
      return { ...state, gameMode: action.mode, lastWin: null };

    case 'DEAL':
      return {
        ...state,
        hand: action.hand,
        heldCards: [false, false, false, false, false],
        phase: 'dealt',
        lastWin: null,
        credits: state.credits - state.bet,
      };

    case 'TOGGLE_HOLD':
      if (state.phase !== 'dealt') return state;
      return {
        ...state,
        heldCards: state.heldCards.map((h, i) => (i === action.index ? !h : h)),
      };

    case 'HOLD_ALL_SHAMROCKS':
      return { ...state, heldCards: state.hand.map(c => !!c.isShamrock) };

    case 'DRAW':
      return {
        ...state,
        hand: action.hand,
        phase: 'drawn',
        lastWin: action.result,
        credits: action.newCredits,
        highScore: action.newHighScore,
        jackpot: action.newJackpot,
      };

    case 'NEW_GAME':
      return { ...state, phase: 'idle', lastWin: null, hand: [], heldCards: [false, false, false, false, false] };

    case 'RESET_CREDITS':
      return { ...state, credits: STARTING_CENTS, phase: 'idle', lastWin: null, hand: [] };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    (async () => {
      const [credits, highScore, gameMode, jackpot] = await Promise.all([
        loadCredits(), loadHighScore(), loadLastMode(), loadJackpot(),
      ]);
      dispatch({ type: 'LOAD', credits, highScore, gameMode, jackpot });
    })();
  }, []);

  const currentMode = GAME_MODES.find(m => m.id === state.gameMode)!;

  const setBet = useCallback((bet: number) => {
    dispatch({ type: 'SET_BET', bet });
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', mode });
    saveLastMode(mode);
  }, []);

  const deal = useCallback(() => {
    if (state.phase === 'dealt') return;
    if (state.credits < state.bet) return;

    const deck = shuffle(createDeck(currentMode.usesJoker));
    const { hand } = dealCards(deck, 5);
    const finalHand = state.gameMode === 'shamrocks' ? applyShamrocks(hand) : hand;
    dispatch({ type: 'DEAL', hand: finalHand });

    if (state.gameMode === 'shamrocks') {
      setTimeout(() => dispatch({ type: 'HOLD_ALL_SHAMROCKS' }), 600);
    }
  }, [state.phase, state.credits, state.bet, state.gameMode, currentMode.usesJoker]);

  const betMax = useCallback(() => {
    dispatch({ type: 'SET_BET', bet: 500 });
  }, []);

  const toggleHold = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_HOLD', index });
  }, []);

  const draw = useCallback(async () => {
    if (state.phase !== 'dealt') return;

    const heldCards = state.hand.filter((_, i) => state.heldCards[i]);
    const freshDeck = shuffle(
      createDeck(currentMode.usesJoker).filter(
        c => !heldCards.some(h => h.suit === c.suit && h.rank === c.rank)
      )
    );
    let deckIndex = 0;
    const newHand: Card[] = state.hand.map((card, i) => {
      if (state.heldCards[i]) return card;
      return freshDeck[deckIndex++] ?? card;
    });

    // Evaluate with bet=1 to get base multiplier, then scale by actual bet cents
    const baseResult = currentMode.evaluate(newHand, 1);

    let result: HandResult;
    if (baseResult.tableIndex === 0 && state.bet >= 200) {
      // Top hand at $2+ bet → jackpot
      result = { name: 'JACKPOT!', tableIndex: 0, payout: state.jackpot };
    } else {
      result = { ...baseResult, payout: baseResult.payout * state.bet };
    }

    const newCredits = state.credits + result.payout;
    const newHighScore = Math.max(state.highScore, newCredits);

    let newJackpot: number;
    if (baseResult.tableIndex === 0 && state.bet >= 200) {
      newJackpot = JACKPOT_BASE;
      await saveJackpot(JACKPOT_BASE);
    } else {
      newJackpot = await contributeToJackpot(state.bet);
    }

    dispatch({ type: 'DRAW', hand: newHand, result, newCredits, newHighScore, newJackpot });

    saveCredits(newCredits);
    if (newCredits > state.highScore) saveHighScore(newCredits);
  }, [state, currentMode]);

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
    currentMode,
    actions: { setBet, betMax, setGameMode, deal, toggleHold, draw, newGame },
  };
}
