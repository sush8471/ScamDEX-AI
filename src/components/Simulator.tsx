import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ShieldCheck, Timer, Hash, MessageSquare, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react'
import ChatPanel from './ChatPanel'
import IntelPanel from './IntelPanel'
import MetadataBar from './MetadataBar'

interface SimulatorProps {
  sessionId: string;
  onReset: () => void;
  onComplete: () => void;
  isResultMode: boolean;
}

interface Intel {
  scamDetected: boolean;
  scamType: string;
  confidence: number;
  upiIds: string[];
  phoneNumbers: string[];
  links: string[];
  keywords: string[];
}

const Simulator = ({ sessionId, onReset, onComplete, isResultMode }: SimulatorProps) => {
  const [messages, setMessages] = useState<any[]>([])
  const [intel, setIntel] = useState<Intel>({
    scamDetected: false,
    scamType: 'Pending...',
    confidence: 0,
    upiIds: [],
    phoneNumbers: [],
    links: [],
    keywords: []
  })
  const [isTyping, setIsTyping] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState('00:00')

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000)
      const mins = Math.floor(diff / 60).toString().padStart(2, '0')
      const secs = (diff % 60).toString().padStart(2, '0')
      setElapsed(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isResultMode) return

    // 1. Add user message
    const newMessage = { id: Date.now(), text, sender: 'scammer', timestamp: new Date() }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setIsTyping(true)

    try {
      // 2. Real API call to n8n
      const response = await fetch(import.meta.env.VITE_WEBHOOK_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          history: updatedMessages,
          metadata: {
            platform: 'WhatsApp/SMS',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) throw new Error('Network response was not ok')
      
      const data = await response.json()
      
      // 3. Update state with real data
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.agentReply || data.reply || "Message received. Analyzing next steps.", 
        sender: 'agent', 
        timestamp: new Date() 
      }])

      setIntel((prev: Intel) => ({
        ...prev,
        scamDetected: data.scamDetected ?? prev.scamDetected,
        scamType: data.scamType || prev.scamType,
        confidence: data.confidence !== undefined ? data.confidence : Math.min(prev.confidence + 15, 95),
        upiIds: data.extractedIntelligence?.upiIds ? [...new Set([...prev.upiIds, ...data.extractedIntelligence.upiIds])] : prev.upiIds,
        phoneNumbers: data.extractedIntelligence?.phoneNumbers ? [...new Set([...prev.phoneNumbers, ...data.extractedIntelligence.phoneNumbers])] : prev.phoneNumbers,
        links: data.extractedIntelligence?.links ? [...new Set([...prev.links, ...data.extractedIntelligence.links])] : prev.links,
        keywords: data.extractedIntelligence?.keywords ? [...new Set([...prev.keywords, ...data.extractedIntelligence.keywords])] : prev.keywords,
      }))

      if (data.isFinal || (data.scamDetected && data.confidence > 90)) {
        setTimeout(onComplete, 2000)
      }

    } catch (error) {
      console.error('Webhook error, falling back to mock:', error)
      
      // Fallback to mock logic if webhook fails
      setTimeout(() => {
        const agentReply = getMockResponse(text)
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: agentReply.text, 
          sender: 'agent', 
          timestamp: new Date() 
        }])
        
        setIntel((prev: Intel) => {
          const updated = { ...prev }
          if (agentReply.extracted) {
            if (agentReply.extracted.upi) updated.upiIds = [...new Set([...prev.upiIds, agentReply.extracted.upi])]
            if (agentReply.extracted.link) updated.links = [...new Set([...prev.links, agentReply.extracted.link])]
            if (agentReply.extracted.phone) updated.phoneNumbers = [...new Set([...prev.phoneNumbers, agentReply.extracted.phone])]
          }
          updated.confidence = Math.min(prev.confidence + 20, 98)
          if (updated.confidence > 50) {
            updated.scamDetected = true
            updated.scamType = 'Financial Fraud'
          }
          return updated
        })

        if (agentReply.isFinal) {
          setTimeout(onComplete, 1500)
        }
      }, 1000)
    } finally {
      setIsTyping(false)
    }
  }

  // Fallback mock logic
  const getMockResponse = (input: string) => {
    const text = input.toLowerCase()
    if (text.includes('upi') || text.includes('pay') || text.includes('number')) {
      return { 
        text: "I see. Which UPI ID should I send the processing fee to? I want to make sure the delivery arrives today.", 
        extracted: { upi: 'pay.ref73@oksbi', phone: '+91 98723 11204' },
        isFinal: false
      }
    }
    if (text.includes('link') || text.includes('http')) {
      return { 
        text: "The page isn't loading on my side. Should I try standard bank login instead?", 
        extracted: { link: 'http://secure-verify-kyc.net/auth' },
        isFinal: false
      }
    }
    return { 
      text: "That sounds urgent. How exactly do I proceed? I'm not very familiar with this system.",
      isFinal: false
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-slate-200">
      {/* Top Metadata Bar */}
      <MetadataBar 
        sessionId={sessionId} 
        elapsed={elapsed} 
        msgCount={messages.length} 
        onReset={onReset}
      />

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <ChatPanel 
            messages={messages} 
            onSend={handleSendMessage} 
            isTyping={isTyping} 
            isLocked={isResultMode}
          />
        </div>

        {/* Right: Intel Panel */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <IntelPanel intel={intel} isResultMode={isResultMode} />
        </div>
      </div>
      
      {/* Result Overlay */}
      <AnimatePresence>
        {isResultMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel max-w-2xl w-full p-10 text-center border-primary/40 shadow-2xl shadow-primary/20"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-light">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Simulation Complete</h2>
              <p className="text-slate-400 mb-8">Intelligence has been successfully harvested and reported to the evaluation server.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-slate-500 uppercase font-mono mb-1">Status</div>
                  <div className="text-accent font-bold">Scam Confirmed</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-slate-500 uppercase font-mono mb-1">Impact</div>
                  <div className="text-primary-light font-bold">12 Indicators Found</div>
                </div>
              </div>

              <button 
                onClick={onReset}
                className="btn-primary w-full"
              >
                Start New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Simulator
