import { useState } from 'react'
import type { KanaType, Level } from '@/lib/kana'
import { LEVEL_LABEL, pickSet } from '@/lib/kana'
import { loadSettings, saveSettings } from '@/lib/storage'
import { Button } from '@/components/ui/button'

type Props = {
  onStart: (type: KanaType, level: Level) => void
}

export function Home({ onStart }: Props) {
  const [type, setType] = useState<KanaType>(() => loadSettings().type)
  const [level, setLevel] = useState<Level>(() => loadSettings().level)

  const setCount = pickSet(type, level).length
  const sampleKana = pickSet(type, level)
    .slice(0, 12)
    .map((e) => e.kana)
    .join(' ')

  const start = () => {
    saveSettings({ type, level })
    onStart(type, level)
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-medium tracking-tight">Kana Drills</h1>
        <p className="mt-1 text-sm text-muted-foreground">Type the romaji. 20 per round.</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Kana
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <TypeButton
            active={type === 'hiragana'}
            label="Hiragana"
            sample="あ い う"
            onClick={() => setType('hiragana')}
          />
          <TypeButton
            active={type === 'katakana'}
            label="Katakana"
            sample="ア イ ウ"
            onClick={() => setType('katakana')}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Level
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((n) => (
            <LevelButton
              key={n}
              active={level === n}
              level={n}
              label={LEVEL_LABEL[n]}
              onClick={() => setLevel(n)}
            />
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-muted/40 p-4">
        <p className="mb-2 text-xs text-muted-foreground">
          {setCount} kana in this set
        </p>
        <p className="text-2xl leading-relaxed" lang="ja">
          {sampleKana}…
        </p>
      </section>

      <div className="mt-auto">
        <Button
          onClick={start}
          className="h-14 w-full rounded-2xl text-base font-semibold"
        >
          Start
        </Button>
      </div>
    </div>
  )
}

function TypeButton({
  active,
  label,
  sample,
  onClick,
}: {
  active: boolean
  label: string
  sample: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="flex flex-col items-start gap-1 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary/10"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xl text-muted-foreground" lang="ja">
        {sample}
      </span>
    </button>
  )
}

function LevelButton({
  active,
  level,
  label,
  onClick,
}: {
  active: boolean
  level: Level
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-background px-3 py-3 transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary/10"
    >
      <span className="text-lg font-semibold">L{level}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </button>
  )
}
