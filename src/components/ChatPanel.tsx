import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Bot, Loader2, ShieldCheck, Download } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ChatPanelProps {
  messages: any[];
  onSend: (text: string) => void;
  onExport: () => void;
  isTyping: boolean;
  isLocked: boolean;
  investigationComplete: boolean;
  stage: string;
}

const ChatPanel = ({ messages, onSend, onExport, isTyping, isLocked, investigationComplete, stage }: ChatPanelProps) => {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLocked && !isTyping) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="flex-1 flex flex-col glass-panel overflow-hidden border-white/5 bg-surface/30">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
            <User size={20} className="text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-white">External Target</div>
              <div className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                stage === "Investigation Complete" ? "bg-green-500/20 text-green-500 border border-green-500/30" :
                stage === "Intelligence Extraction" ? "bg-alert/20 text-alert border border-alert/30" :
                stage === "Engagement" ? "bg-accent/20 text-accent border border-accent/30" :
                "bg-slate-700/50 text-slate-400 border border-white/5"
              )}>
                {stage}
              </div>
            </div>
            <div className="text-[10px] text-accent font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              Connected via SMS
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Complete Badge */}
      <AnimatePresence>
        {investigationComplete && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-green-500/10 border-b border-green-500/20 px-6 py-2.5 flex items-center justify-center gap-2 overflow-hidden"
          >
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Investigation Complete</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Send size={32} />
            </div>
            <p className="max-w-xs text-sm">Paste the first message from the scammer to initiate the autonomous engagement.</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.sender === 'agent' ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {msg.sender === 'agent' ? (
                <>
                  <span className="text-[10px] font-mono text-primary-light uppercase tracking-tighter">AI AGENT</span>
                  <Bot size={12} className="text-primary-light" />
                </>
              ) : (
                <>
                  <User size={12} className="text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">SCAMMER</span>
                </>
              )}
            </div>

            <div 
              title={new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words cursor-help",
                msg.sender === 'agent' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-none"
              )}
            >
              {msg.text.split(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi).map((part: string, i: number) => {
                if (part && part.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi)) {
                  return (
                    <a 
                      key={i}
                      href={part.startsWith('http') ? part : `https://${part}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline font-medium hover:text-accent-light transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {part}
                    </a>
                  )
                }
                return part
              })}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-end ml-auto">
            <div className="flex items-center gap-2 mb-1.5 px-1 text-primary-light">
              <span className="text-[10px] font-mono uppercase tracking-tighter">AI AGENT</span>
              <Loader2 size={12} className="animate-spin" />
            </div>
            <div className="bg-primary/20 border border-primary/30 px-4 py-3 rounded-2xl rounded-tr-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input / Completion Area */}
      <div className="p-6 pt-0">
        <AnimatePresence mode="wait">
          {!investigationComplete ? (
            <motion.form 
              key="input-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleSubmit}
              className="relative"
            >
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl focus-within:border-primary/50 transition-colors shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLocked || isTyping}
                  placeholder="Message target..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 disabled:cursor-not-allowed text-white placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isLocked || isTyping || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-dark text-white rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-700 disabled:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="completion-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative p-6 bg-surface/90 border border-white/10 rounded-2xl text-center backdrop-blur-md">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
                  <ShieldCheck className="text-accent" size={24} />
                </div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.2em] mb-2">
                  Communication Link Terminated
                </h3>
                <div className="h-px w-12 bg-white/10 mx-auto mb-3" />
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
                  The autonomous engagement has concluded successfully. All intelligence has been harvested and the communication channel has been neutralized.
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full shadow-[0_0_5px_rgba(56,189,248,0.8)]" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Archived</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExport}
                  className="mt-6 w-full py-3 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <Download size={16} />
                  Download Investigation Transcript
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ChatPanel
