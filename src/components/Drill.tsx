import { useEffect, useMemo, useRef } from 'react'
import type { Direction, KanaType, Level, KanaEntry } from '@/lib/kana'
import { pickSet } from '@/lib/kana'
import { useDrillSession } from '@/hooks/useDrillSession'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

export type DrillResult = {
  correct: number
  total: number
  mistakes: KanaEntry[]
  elapsedMs: number
}

type Props = {
  type: KanaType
  level: Level
  direction: Direction
  onDone: (result: DrillResult) => void
  onQuit: () => void
}

const GUESS_OPTION_COUNT = 8
const WORD_KEY_COUNT = 12

function buildOptions(set: KanaEntry[], current: KanaEntry, seed: number): KanaEntry[] {
  if (set.length <= GUESS_OPTION_COUNT) return shuffle(set, seed)
  const pool = set.filter((e) => e.kana !== current.kana)
  const picks: KanaEntry[] = []
  const shuffled = shuffle(pool, seed)
  for (let i = 0; i < GUESS_OPTION_COUNT - 1 && i < shuffled.length; i++) {
    picks.push(shuffled[i])
  }
  picks.push(current)
  return shuffle(picks, seed ^ 0x9e3779b9)
}

function buildKanaKeys(target: string, pool: string[], seed: number): string[] {
  const need = Array.from(new Set(Array.from(target)))
  const distractorPool = pool.filter((c) => !need.includes(c))
  const shuffledDistractors = shuffle(distractorPool, seed)
  const keys: string[] = [...need]
  for (let i = 0; keys.length < WORD_KEY_COUNT && i < shuffledDistractors.length; i++) {
    keys.push(shuffledDistractors[i])
  }
  return shuffle(keys, seed ^ 0x9e3779b9)
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice()
  let s = (seed || 1) >>> 0
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function Drill({ type, level, direction, onDone, onQuit }: Props) {
  const { state, current, set, done, total, onType, onSubmit, onPick, onTapKana, onBackspace } =
    useDrillSession(type, level, direction)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const isWord = type === 'words'
  const isGuess = direction === 'guess'

  useEffect(() => {
    if (isGuess) return
    inputRef.current?.focus()
  }, [state.index, isGuess])

  // In read mode iOS closes the soft keyboard on blur and won't reopen it on
  // its own. Tapping anywhere outside the input (prompt, translation, hint)
  // should bring it back without forcing the user to hit the input itself.
  const refocusIfRead = () => {
    if (isGuess) return
    if (state.revealed) return
    const el = inputRef.current
    if (el && document.activeElement !== el) el.focus()
  }

  useEffect(() => {
    if (!done || state.finishedAt === null || doneRef.current) return
    doneRef.current = true
    onDoneRef.current({
      correct: state.correct,
      total,
      mistakes: state.mistakes,
      elapsedMs: state.finishedAt - state.startedAt,
    })
  }, [done, state.finishedAt, state.correct, state.mistakes, state.startedAt, total])

  const progress = done ? 100 : (state.index / total) * 100

  const kanaCharPool = useMemo(() => {
    if (!(isGuess && isWord)) return []
    const chars = new Set<string>()
    for (const entry of pickSet('hiragana', 3)) {
      for (const ch of Array.from(entry.kana)) chars.add(ch)
    }
    return [...chars]
  }, [isGuess, isWord])

  const wordKeys = useMemo(() => {
    if (!(isGuess && isWord) || !current) return []
    return buildKanaKeys(current.kana, kanaCharPool, state.index + 1)
  }, [isGuess, isWord, current, kanaCharPool, state.index])

  const options = useMemo(
    () => (isGuess && !isWord && current ? buildOptions(set, current, state.index + 1) : []),
    [isGuess, isWord, current, set, state.index]
  )

  const promptSizeClass =
    isGuess && isWord
      ? 'text-[min(2rem,7dvh)] leading-[1.25] text-center sm:text-[min(2.5rem,9dvh)]'
      : isGuess
        ? 'font-mono text-[min(5rem,16dvh)] leading-[1.2] sm:text-[min(7rem,20dvh)]'
        : isWord
          ? 'text-[min(4rem,14dvh)] leading-[1.2] sm:text-[min(6rem,18dvh)]'
          : 'text-[min(9rem,26dvh)] leading-[1.1] sm:text-[min(12rem,32dvh)]'

  return (
    <div
      className="flex flex-col overflow-hidden px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ height: 'var(--app-height, 100dvh)' }}
      onPointerDown={refocusIfRead}
    >
      <header className="mb-6 flex items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {Math.min(state.index + 1, total)}/{total}
        </span>
        <Progress value={progress} className="h-2 flex-1" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {state.correct}✓
        </span>
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
        {current && (
          <>
            <div
              key={state.index}
              data-retry={state.retry}
              className={`${promptSizeClass} font-medium transition-colors data-[retry=true]:text-destructive`}
              lang={isGuess ? undefined : 'ja'}
            >
              {isGuess
                ? isWord
                  ? current.translation
                  : current.romaji[0]
                : current.kana}
            </div>
            {isGuess && isWord && !state.revealed && (
              <div
                data-retry={state.retry}
                className="mt-6 min-h-[3rem] rounded-2xl border border-border px-5 py-2 text-center text-3xl font-medium tracking-wide data-[retry=true]:border-destructive"
                lang="ja"
              >
                {state.input || (
                  <span className="text-muted-foreground">·</span>
                )}
              </div>
            )}
            {state.revealed && current.translation && (
              <div className="mt-6 flex flex-col items-center gap-1 text-center">
                {isGuess && isWord && (
                  <span className="text-3xl font-medium" lang="ja">
                    {current.kana}
                  </span>
                )}
                <span className="font-mono text-base text-muted-foreground">
                  {current.romaji[0]}
                </span>
                {!(isGuess && isWord) && (
                  <span className="text-xl font-medium text-foreground">
                    {current.translation}
                  </span>
                )}
                <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  {isGuess && isWord ? 'Tap continue' : 'Enter to continue'}
                </span>
              </div>
            )}
            {!state.revealed && state.retry && !isGuess && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Answer:{' '}
                <span className="font-mono text-base text-foreground">
                  {current.romaji[0]}
                </span>
                {current.romaji.length > 1 && (
                  <span className="ml-1 font-mono">
                    ({current.romaji.slice(1).join(', ')})
                  </span>
                )}
              </p>
            )}
            {state.retry && isGuess && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Answer:{' '}
                <span className="text-2xl text-foreground" lang="ja">
                  {current.kana}
                </span>
                {isWord && (
                  <span className="ml-2 font-mono text-sm text-muted-foreground">
                    ({current.romaji[0]})
                  </span>
                )}
              </p>
            )}
          </>
        )}
      </section>

      {isGuess && isWord ? (
        <div className="mt-6">
          {state.revealed ? (
            <button
              type="button"
              onClick={() => onSubmit()}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-colors active:bg-primary/90"
            >
              Continue →
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {wordKeys.map((ch, idx) => (
                <button
                  key={`${ch}-${idx}`}
                  type="button"
                  onClick={() => onTapKana(ch)}
                  className="flex h-14 items-center justify-center rounded-2xl border border-border bg-background text-2xl font-medium transition-colors active:bg-muted"
                  lang="ja"
                >
                  {ch}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onBackspace()}
                disabled={state.input.length === 0}
                className="col-span-4 flex h-12 items-center justify-center rounded-2xl border border-border bg-muted/40 text-sm font-medium text-muted-foreground transition-colors active:bg-muted disabled:opacity-40"
              >
                ⌫ Backspace
              </button>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{state.revealed ? '' : 'Spell the word'}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Quit this round?')) onQuit()
              }}
              className="underline-offset-4 hover:underline"
            >
              Quit
            </button>
          </div>
        </div>
      ) : isGuess ? (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-2">
            {options.map((opt) => {
              const isAnswer = current && opt.kana === current.kana
              const showCorrect = state.retry && isAnswer
              return (
                <button
                  key={opt.kana}
                  type="button"
                  onClick={() => onPick(opt.kana)}
                  data-correct={showCorrect}
                  className="flex h-16 items-center justify-center rounded-2xl border border-border bg-background text-3xl font-medium transition-colors active:bg-muted data-[correct=true]:border-primary data-[correct=true]:bg-primary/20"
                  lang="ja"
                >
                  {opt.kana}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Tap the right kana</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Quit this round?')) onQuit()
              }}
              className="underline-offset-4 hover:underline"
            >
              Quit
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <Input
            ref={inputRef}
            value={state.input}
            onChange={(e) => onType(e.target.value)}
            placeholder="romaji"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
            autoFocus
            readOnly={state.revealed}
            aria-label="Romaji input"
            data-retry={state.retry}
            data-revealed={state.revealed}
            className="h-14 rounded-2xl text-center !text-2xl font-mono data-[retry=true]:border-destructive data-[retry=true]:ring-3 data-[retry=true]:ring-destructive/30 data-[revealed=true]:border-primary data-[revealed=true]:ring-3 data-[revealed=true]:ring-primary/30"
          />
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Enter to submit</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Quit this round?')) onQuit()
              }}
              className="underline-offset-4 hover:underline"
            >
              Quit
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
