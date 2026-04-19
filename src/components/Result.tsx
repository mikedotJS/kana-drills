import type { DrillResult } from './Drill'
import { Button } from '@/components/ui/button'

type Props = {
  result: DrillResult
  onPlayAgain: () => void
  onHome: () => void
}

function formatTime(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function dedupe(entries: DrillResult['mistakes']) {
  const seen = new Map<string, DrillResult['mistakes'][number]>()
  for (const e of entries) seen.set(e.kana, e)
  return [...seen.values()]
}

export function Result({ result, onPlayAgain, onHome }: Props) {
  const { correct, total, mistakes, elapsedMs } = result
  const accuracy = Math.round((correct / total) * 100)
  const missed = dedupe(mistakes)

  return (
    <div
      className="flex flex-col overflow-y-auto px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Round complete</p>
        <h1 className="mt-2 font-heading text-5xl font-medium tabular-nums">
          {correct}
          <span className="text-muted-foreground">/{total}</span>
        </h1>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3">
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Time" value={formatTime(elapsedMs)} />
      </section>

      <section className="mb-8 flex-1">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {missed.length > 0 ? `Missed (${missed.length})` : 'No mistakes'}
        </h2>
        {missed.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {missed.map((e) => (
              <li
                key={e.kana}
                className="flex flex-col items-center rounded-xl bg-muted/40 py-3"
              >
                <span className="text-3xl" lang="ja">
                  {e.kana}
                </span>
                <span className="mt-1 font-mono text-xs text-muted-foreground">
                  {e.romaji[0]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-auto grid gap-3">
        <Button
          onClick={onPlayAgain}
          className="h-14 w-full rounded-2xl text-base font-semibold"
        >
          Play again
        </Button>
        <Button
          variant="ghost"
          onClick={onHome}
          className="h-12 w-full rounded-2xl text-sm"
        >
          Home
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-medium tabular-nums">{value}</p>
    </div>
  )
}
