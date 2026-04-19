import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { KanaEntry, KanaType, Level } from '@/lib/kana'
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
  // Mistake already recorded; user must retype correct answer to advance.
  retry: boolean
  startedAt: number
  finishedAt: number | null
}

type Action =
  | { type: 'TYPE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; deck: KanaEntry[] }

function reducer(state: DrillState, action: Action): DrillState {
  switch (action.type) {
    case 'TYPE': {
      const current = state.deck[state.index]
      if (!current) return state
      const nextInput = action.value
      // On every keystroke, if input matches: advance.
      if (isMatch(current, nextInput)) {
        const newIndex = state.index + 1
        const done = newIndex >= state.deck.length
        return {
          ...state,
          input: '',
          retry: false,
          index: newIndex,
          correct: state.retry ? state.correct : state.correct + 1,
          finishedAt: done ? Date.now() : null,
        }
      }
      return { ...state, input: nextInput }
    }
    case 'SUBMIT': {
      const current = state.deck[state.index]
      if (!current) return state
      // Correct submission — normally caught by TYPE, but handle Enter on edge cases.
      if (isMatch(current, state.input)) {
        const newIndex = state.index + 1
        const done = newIndex >= state.deck.length
        return {
          ...state,
          input: '',
          retry: false,
          index: newIndex,
          correct: state.retry ? state.correct : state.correct + 1,
          finishedAt: done ? Date.now() : null,
        }
      }
      // Wrong submission — record mistake once, enter retry mode.
      if (state.retry) return state
      if (!state.input.trim()) return state
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
    startedAt: Date.now(),
    finishedAt: null,
  }
}

export function useDrillSession(type: KanaType, level: Level) {
  const initialDeck = useMemo(() => buildDeck(pickSet(type, level)), [type, level])
  const [state, dispatch] = useReducer(reducer, initialDeck, initial)
  const settingsRef = useRef({ type, level })
  useEffect(() => {
    settingsRef.current = { type, level }
  }, [type, level])

  const current = state.deck[state.index] ?? null
  const done = state.finishedAt !== null

  return {
    state,
    current,
    done,
    total: ROUND_LENGTH,
    onType: (value: string) => dispatch({ type: 'TYPE', value }),
    onSubmit: () => dispatch({ type: 'SUBMIT' }),
    restart: () => {
      const { type, level } = settingsRef.current
      dispatch({ type: 'RESET', deck: buildDeck(pickSet(type, level)) })
    },
  }
}
