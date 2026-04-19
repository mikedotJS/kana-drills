import type { KanaType, Level } from './kana'

const KEY = 'kana-drills:v1'

export type Settings = {
  type: KanaType
  level: Level
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { type: 'hiragana', level: 1 }
    const parsed = JSON.parse(raw) as Partial<Settings>
    const type: KanaType = parsed.type === 'katakana' ? 'katakana' : 'hiragana'
    const level: Level = parsed.level === 2 || parsed.level === 3 ? parsed.level : 1
    return { type, level }
  } catch {
    return { type: 'hiragana', level: 1 }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // ignore — private mode etc.
  }
}
