import type { KanaEntry } from './kana'

export type WordEntry = KanaEntry & { translation: string }

const GREETINGS: WordEntry[] = [
  { kana: 'こんにちは', romaji: ['konnichiwa'], translation: 'hello / good afternoon' },
  { kana: 'おはよう', romaji: ['ohayou', 'ohayo'], translation: 'good morning' },
  { kana: 'こんばんは', romaji: ['konbanwa'], translation: 'good evening' },
  { kana: 'おやすみ', romaji: ['oyasumi'], translation: 'good night' },
  { kana: 'さようなら', romaji: ['sayounara', 'sayonara'], translation: 'goodbye' },
  { kana: 'ありがとう', romaji: ['arigatou', 'arigato'], translation: 'thank you' },
  { kana: 'すみません', romaji: ['sumimasen'], translation: 'excuse me / sorry' },
  { kana: 'ごめんなさい', romaji: ['gomennasai'], translation: "I'm sorry" },
  { kana: 'はじめまして', romaji: ['hajimemashite'], translation: 'nice to meet you' },
  { kana: 'はい', romaji: ['hai'], translation: 'yes' },
  { kana: 'いいえ', romaji: ['iie'], translation: 'no' },
  { kana: 'どうぞ', romaji: ['douzo', 'dozo'], translation: 'please / go ahead' },
]

const COMMON_NOUNS: WordEntry[] = [
  { kana: 'ねこ', romaji: ['neko'], translation: 'cat' },
  { kana: 'いぬ', romaji: ['inu'], translation: 'dog' },
  { kana: 'みず', romaji: ['mizu'], translation: 'water' },
  { kana: 'ひと', romaji: ['hito'], translation: 'person' },
  { kana: 'ほん', romaji: ['hon'], translation: 'book' },
  { kana: 'くるま', romaji: ['kuruma'], translation: 'car' },
  { kana: 'でんしゃ', romaji: ['densha'], translation: 'train' },
  { kana: 'がっこう', romaji: ['gakkou', 'gakko'], translation: 'school' },
  { kana: 'せんせい', romaji: ['sensei'], translation: 'teacher' },
  { kana: 'がくせい', romaji: ['gakusei'], translation: 'student' },
  { kana: 'ともだち', romaji: ['tomodachi'], translation: 'friend' },
  { kana: 'かぞく', romaji: ['kazoku'], translation: 'family' },
  { kana: 'おかあさん', romaji: ['okaasan', 'okasan'], translation: 'mother' },
  { kana: 'おとうさん', romaji: ['otousan', 'otosan'], translation: 'father' },
  { kana: 'たべもの', romaji: ['tabemono'], translation: 'food' },
  { kana: 'のみもの', romaji: ['nomimono'], translation: 'drink' },
  { kana: 'おちゃ', romaji: ['ocha'], translation: 'tea' },
  { kana: 'こめ', romaji: ['kome'], translation: 'rice' },
]

const VERBS_AND_ADJECTIVES: WordEntry[] = [
  { kana: 'たべる', romaji: ['taberu'], translation: 'to eat' },
  { kana: 'のむ', romaji: ['nomu'], translation: 'to drink' },
  { kana: 'みる', romaji: ['miru'], translation: 'to see / watch' },
  { kana: 'きく', romaji: ['kiku'], translation: 'to listen / ask' },
  { kana: 'いく', romaji: ['iku'], translation: 'to go' },
  { kana: 'くる', romaji: ['kuru'], translation: 'to come' },
  { kana: 'はなす', romaji: ['hanasu'], translation: 'to speak' },
  { kana: 'よむ', romaji: ['yomu'], translation: 'to read' },
  { kana: 'かく', romaji: ['kaku'], translation: 'to write' },
  { kana: 'べんきょう', romaji: ['benkyou', 'benkyo'], translation: 'study' },
  { kana: 'しごと', romaji: ['shigoto'], translation: 'work / job' },
  { kana: 'りょこう', romaji: ['ryokou', 'ryoko'], translation: 'travel' },
  { kana: 'おおきい', romaji: ['ookii', 'ooki', 'okii'], translation: 'big' },
  { kana: 'ちいさい', romaji: ['chiisai', 'chisai'], translation: 'small' },
  { kana: 'あたらしい', romaji: ['atarashii', 'atarashi'], translation: 'new' },
  { kana: 'ふるい', romaji: ['furui'], translation: 'old' },
  { kana: 'むずかしい', romaji: ['muzukashii', 'muzukashi'], translation: 'difficult' },
  { kana: 'たのしい', romaji: ['tanoshii', 'tanoshi'], translation: 'fun / enjoyable' },
]

import type { Level } from './kana'

export function pickWordSet(level: Level): WordEntry[] {
  if (level === 1) return GREETINGS
  if (level === 2) return [...GREETINGS, ...COMMON_NOUNS]
  return [...GREETINGS, ...COMMON_NOUNS, ...VERBS_AND_ADJECTIVES]
}

export const WORD_LEVEL_LABEL: Record<Level, string> = {
  1: 'Greetings',
  2: '+ Nouns',
  3: '+ Verbs',
}
