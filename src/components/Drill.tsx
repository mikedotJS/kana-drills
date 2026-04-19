import { useEffect, useRef } from 'react'
import type { KanaType, Level, KanaEntry } from '@/lib/kana'
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
  onDone: (result: DrillResult) => void
  onQuit: () => void
}

export function Drill({ type, level, onDone, onQuit }: Props) {
  const { state, current, done, total, onType, onSubmit } = useDrillSession(type, level)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    inputRef.current?.focus()
  }, [state.index])

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

  return (
    <div
      className="flex flex-col overflow-hidden px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ height: 'var(--app-height, 100dvh)' }}
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
              className="text-[min(9rem,26dvh)] leading-[1.1] font-medium transition-colors data-[retry=true]:text-destructive sm:text-[min(12rem,32dvh)]"
              lang="ja"
            >
              {current.kana}
            </div>
            {state.retry && (
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
          </>
        )}
      </section>

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
          aria-label="Romaji input"
          data-retry={state.retry}
          className="h-14 rounded-2xl text-center !text-2xl font-mono data-[retry=true]:border-destructive data-[retry=true]:ring-3 data-[retry=true]:ring-destructive/30"
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
    </div>
  )
}
