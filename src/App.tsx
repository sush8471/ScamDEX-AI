import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import Simulator from './components/Simulator'
import { v4 as uuidv4 } from 'uuid'

export type AppState = 'landing' | 'simulation' | 'result'

function App() {
  const [view, setView] = useState<AppState>('landing')
  const [sessionId, setSessionId] = useState('')

  const startSimulation = () => {
    setSessionId(uuidv4())
    setView('simulation')
  }

  const reset = () => {
    setView('landing')
    setSessionId('')
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Landing onStart={startSimulation} />
          </motion.div>
        ) : (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Simulator 
              sessionId={sessionId} 
              onReset={reset} 
              onComplete={() => setView('result')} 
              isResultMode={view === 'result'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
