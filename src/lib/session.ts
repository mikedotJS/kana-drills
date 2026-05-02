import type { KanaEntry } from './kana'

export const ROUND_LENGTH = 20

function shuffleCopy<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function buildDeck(set: KanaEntry[], length = ROUND_LENGTH): KanaEntry[] {
  if (set.length === 0) return []
  // Cycle through shuffled copies of the set so every entry is used before any
  // is repeated. When the set is at least as large as the round, the deck is
  // entirely unique. When the set is smaller, repeats are spread out and we
  // also avoid placing the same entry back-to-back across cycle boundaries.
  const deck: KanaEntry[] = []
  while (deck.length < length) {
    const shuffled = shuffleCopy(set)
    if (
      deck.length > 0 &&
      shuffled.length > 1 &&
      shuffled[0].kana === deck[deck.length - 1].kana
    ) {
      ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    }
    const remaining = length - deck.length
    for (let i = 0; i < remaining && i < shuffled.length; i++) {
      deck.push(shuffled[i])
    }
  }
  return deck
}
