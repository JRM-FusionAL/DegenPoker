import { useCallback, useEffect, useReducer } from 'react';
import { Card } from '../types/card';
import { GameMode, GamePhase, GameState, HandResult } from '../types/game';
import { createDeck, dealCards, shuffle, applyShamrocks } from '../utils/deck';
import {
  loadCredits, loadHighScore, loadLastMode,
  saveCredits, saveHighScore, saveLastMode,
  STARTING_CREDITS,
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
  credits: STARTING_CREDITS,
  highScore: STARTING_CREDITS,
  bet: 1,
  hand: [],
  heldCards: [false, false, false, false, false],
  phase: 'idle',
  lastWin: null,
  gameMode: 'jacksOrBetter',
};

type Action =
  | { type: 'LOAD'; credits: number; highScore: number; gameMode: GameMode }
  | { type: 'SET_BET'; bet: number }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'DEAL'; hand: Card[] }
  | { type: 'TOGGLE_HOLD'; index: number }
  | { type: 'HOLD_ALL_SHAMROCKS' }
  | { type: 'DRAW'; hand: Card[]; result: HandResult; newCredits: number; newHighScore: number }
  | { type: 'NEW_GAME' }
  | { type: 'RESET_CREDITS' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, credits: action.credits, highScore: action.highScore, gameMode: action.gameMode };

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
      return {
        ...state,
        heldCards: state.hand.map(c => !!c.isShamrock),
      };

    case 'DRAW':
      return {
        ...state,
        hand: action.hand,
        phase: 'drawn',
        lastWin: action.result,
        credits: action.newCredits,
        highScore: action.newHighScore,
      };

    case 'NEW_GAME':
      return { ...state, phase: 'idle', lastWin: null, hand: [], heldCards: [false, false, false, false, false] };

    case 'RESET_CREDITS':
      return { ...state, credits: STARTING_CREDITS, phase: 'idle', lastWin: null, hand: [] };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    (async () => {
      const [credits, highScore, gameMode] = await Promise.all([
        loadCredits(),
        loadHighScore(),
        loadLastMode(),
      ]);
      dispatch({ type: 'LOAD', credits, highScore, gameMode });
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
      // Auto-hold shamrock cards after a brief delay (caller triggers animation)
      setTimeout(() => dispatch({ type: 'HOLD_ALL_SHAMROCKS' }), 600);
    }
  }, [state.phase, state.credits, state.bet, state.gameMode, currentMode.usesJoker]);

  const betMax = useCallback(() => {
    dispatch({ type: 'SET_BET', bet: 5 });
  }, []);

  const toggleHold = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_HOLD', index });
  }, []);

  const draw = useCallback(() => {
    if (state.phase !== 'dealt') return;

    const deck = shuffle(createDeck(currentMode.usesJoker));
    const newHand: Card[] = state.hand.map((card, i) => {
      if (state.heldCards[i]) return card;
      const { hand } = dealCards(deck.filter(c => !state.hand.includes(c)), 1);
      return hand[0] ?? card;
    });

    const result = currentMode.evaluate(newHand, state.bet);
    const newCredits = state.credits + result.payout;
    const newHighScore = Math.max(state.highScore, newCredits);

    dispatch({ type: 'DRAW', hand: newHand, result, newCredits, newHighScore });

    saveCredits(newCredits);
    if (newCredits > state.highScore) saveHighScore(newCredits);
  }, [state, currentMode]);

  const newGame = useCallback(() => {
    if (state.credits <= 0) {
      dispatch({ type: 'RESET_CREDITS' });
      saveCredits(STARTING_CREDITS);
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
