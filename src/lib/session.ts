import type { KanaEntry } from './kana'

export const ROUND_LENGTH = 20

export function buildDeck(set: KanaEntry[], length = ROUND_LENGTH): KanaEntry[] {
  if (set.length === 0) return []
  const deck: KanaEntry[] = []
  let prev: KanaEntry | null = null
  for (let i = 0; i < length; i++) {
    let next = set[Math.floor(Math.random() * set.length)]
    // Avoid immediate repeats when the set has > 1 entry.
    if (set.length > 1 && prev && next.kana === prev.kana) {
      next = set[(set.indexOf(next) + 1) % set.length]
    }
    deck.push(next)
    prev = next
  }
  return deck
}
