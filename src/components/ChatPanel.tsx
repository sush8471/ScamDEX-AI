import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ChatPanelProps {
  messages: any[];
  onSend: (text: string) => void;
  isTyping: boolean;
  isLocked: boolean;
}

const ChatPanel = ({ messages, onSend, isTyping, isLocked }: ChatPanelProps) => {
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
            <div className="text-sm font-bold text-white">External Target</div>
            <div className="text-[10px] text-accent font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              Connected via SMS
            </div>
          </div>
        </div>
      </div>

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

            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.sender === 'agent' 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-none"
            )}>
              {msg.text}
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

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="p-6 pt-0"
      >
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLocked || isTyping}
            placeholder={isLocked ? "Session Complete" : "Message target..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLocked || isTyping || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-dark text-white rounded-lg transition-all active:scale-90 disabled:opacity-50 disabled:bg-slate-700"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatPanel
