import { useCallback, useEffect, useState } from 'react'
import type { Direction, KanaType, Level } from '@/lib/kana'
import { Home } from '@/components/Home'
import { Drill, type DrillResult } from '@/components/Drill'
import { Result } from '@/components/Result'

type View =
  | { name: 'home' }
  | { name: 'drill'; type: KanaType; level: Level; direction: Direction; nonce: number }
  | {
      name: 'result'
      type: KanaType
      level: Level
      direction: Direction
      result: DrillResult
    }

function App() {
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => {
    const vv = window.visualViewport
    const update = () => {
      const h = vv?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${h}px`)
    }
    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  const start = useCallback((type: KanaType, level: Level, direction: Direction) => {
    setView({ name: 'drill', type, level, direction, nonce: Date.now() })
  }, [])

  const finish = useCallback(
    (result: DrillResult) => {
      if (view.name !== 'drill') return
      setView({
        name: 'result',
        type: view.type,
        level: view.level,
        direction: view.direction,
        result,
      })
    },
    [view]
  )

  const goHome = useCallback(() => setView({ name: 'home' }), [])

  if (view.name === 'home') {
    return <Home onStart={start} />
  }
  if (view.name === 'drill') {
    return (
      <Drill
        key={view.nonce}
        type={view.type}
        level={view.level}
        direction={view.direction}
        onDone={finish}
        onQuit={goHome}
      />
    )
  }
  return (
    <Result
      result={view.result}
      onPlayAgain={() => start(view.type, view.level, view.direction)}
      onHome={goHome}
    />
  )
}

export default App
