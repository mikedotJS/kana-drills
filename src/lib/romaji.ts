import type { KanaEntry } from './kana'

export function normalize(input: string): string {
  return input.trim().toLowerCase()
}

export function isMatch(entry: KanaEntry, input: string): boolean {
  const n = normalize(input)
  if (!n) return false
  return entry.romaji.includes(n)
}
