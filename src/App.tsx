import { useCallback, useEffect, useState } from 'react'
import type { KanaType, Level } from '@/lib/kana'
import { Home } from '@/components/Home'
import { Drill, type DrillResult } from '@/components/Drill'
import { Result } from '@/components/Result'

type View =
  | { name: 'home' }
  | { name: 'drill'; type: KanaType; level: Level; nonce: number }
  | { name: 'result'; type: KanaType; level: Level; result: DrillResult }

function App() {
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      document.documentElement.style.setProperty('--app-height', `${vv.height}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const start = useCallback((type: KanaType, level: Level) => {
    setView({ name: 'drill', type, level, nonce: Date.now() })
  }, [])

  const finish = useCallback(
    (result: DrillResult) => {
      if (view.name !== 'drill') return
      setView({ name: 'result', type: view.type, level: view.level, result })
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
        onDone={finish}
        onQuit={goHome}
      />
    )
  }
  return (
    <Result
      result={view.result}
      onPlayAgain={() => start(view.type, view.level)}
      onHome={goHome}
    />
  )
}

export default App
