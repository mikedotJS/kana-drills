import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { Direction, KanaEntry, KanaType, Level } from '@/lib/kana'
import { pickSet } from '@/lib/kana'
import { isMatch } from '@/lib/romaji'
import { buildDeck, ROUND_LENGTH } from '@/lib/session'

export type DrillState = {
  deck: KanaEntry[]
  index: number
  input: string
  correct: number
  mistakes: KanaEntry[]
  // Set when user submitted a wrong answer on the current prompt.
  // Mistake already recorded; user must retype/retap correct answer to advance.
  retry: boolean
  // Set when the current prompt has a translation and the user just answered
  // correctly; the UI shows the translation and waits for the user to confirm
  // before advancing.
  revealed: boolean
  startedAt: number
  finishedAt: number | null
}

type Action =
  | { type: 'TYPE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'PICK'; kana: string }
  | { type: 'RESET'; deck: KanaEntry[] }

function advance(state: DrillState, creditCorrect: boolean): DrillState {
  const newIndex = state.index + 1
  const done = newIndex >= state.deck.length
  return {
    ...state,
    input: '',
    retry: false,
    revealed: false,
    index: newIndex,
    correct: creditCorrect ? state.correct + 1 : state.correct,
    finishedAt: done ? Date.now() : null,
  }
}

function reducer(state: DrillState, action: Action): DrillState {
  switch (action.type) {
    case 'TYPE': {
      const current = state.deck[state.index]
      if (!current) return state
      if (state.revealed) return state
      const nextInput = action.value
      if (isMatch(current, nextInput)) {
        if (current.translation) {
          return { ...state, input: nextInput, revealed: true }
        }
        return advance(state, !state.retry)
      }
      return { ...state, input: nextInput }
    }
    case 'SUBMIT': {
      const current = state.deck[state.index]
      if (!current) return state
      if (state.revealed) {
        return advance(state, !state.retry)
      }
      if (isMatch(current, state.input)) {
        if (current.translation) {
          return { ...state, revealed: true }
        }
        return advance(state, !state.retry)
      }
      if (state.retry) return state
      if (!state.input.trim()) return state
      return {
        ...state,
        retry: true,
        mistakes: [...state.mistakes, current],
      }
    }
    case 'PICK': {
      const current = state.deck[state.index]
      if (!current) return state
      if (action.kana === current.kana) {
        return advance(state, !state.retry)
      }
      if (state.retry) return state
      return {
        ...state,
        retry: true,
        mistakes: [...state.mistakes, current],
      }
    }
    case 'RESET':
      return initial(action.deck)
  }
}

function initial(deck: KanaEntry[]): DrillState {
  return {
    deck,
    index: 0,
    input: '',
    correct: 0,
    mistakes: [],
    retry: false,
    revealed: false,
    startedAt: Date.now(),
    finishedAt: null,
  }
}

export function useDrillSession(type: KanaType, level: Level, direction: Direction = 'read') {
  const set = useMemo(() => pickSet(type, level), [type, level])
  const initialDeck = useMemo(() => buildDeck(set), [set])
  const [state, dispatch] = useReducer(reducer, initialDeck, initial)
  const settingsRef = useRef({ type, level, direction })
  useEffect(() => {
    settingsRef.current = { type, level, direction }
  }, [type, level, direction])

  const current = state.deck[state.index] ?? null
  const done = state.finishedAt !== null

  return {
    state,
    current,
    set,
    done,
    total: ROUND_LENGTH,
    onType: (value: string) => dispatch({ type: 'TYPE', value }),
    onSubmit: () => dispatch({ type: 'SUBMIT' }),
    onPick: (kana: string) => dispatch({ type: 'PICK', kana }),
    restart: () => {
      const { type, level } = settingsRef.current
      dispatch({ type: 'RESET', deck: buildDeck(pickSet(type, level)) })
    },
  }
}
