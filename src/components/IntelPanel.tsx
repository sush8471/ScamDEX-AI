import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { AlertCircle, ShieldCheck, Activity, Database, Smartphone, Link as LinkIcon, Hash, Copy, ExternalLink, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, {
    stiffness: 45,
    damping: 15,
    mass: 1,
  })
  
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

interface IntelPanelProps {
  intel: {
    scamDetected: boolean;
    scamType: string;
    confidence: number;
    upiIds: string[];
    phoneNumbers: string[];
    links: string[];
    keywords: string[];
    logs: { type: 'ok' | 'wait' | 'warn' | 'info'; message: string; timestamp: string }[];
  };
  isResultMode: boolean;
  indicatorCount: number;
  userMsgCount: number;
}

const IntelPanel = ({ intel, isResultMode, indicatorCount, userMsgCount }: IntelPanelProps) => {
  const isInitialState = userMsgCount <= 1;
  const displayConfidence = isInitialState ? Math.min(intel.confidence, 10) : intel.confidence;

  // 1. Create a spring-driven confidence value for smooth color interpolation
  const springConfidence = useSpring(displayConfidence, {
    stiffness: 45,
    damping: 15,
    mass: 1,
  })

  useEffect(() => {
    springConfidence.set(displayConfidence)
  }, [displayConfidence, springConfidence])

  // 2. Map the confidence value to specific colors (Blue -> Amber -> Red)
  const colorScale = useTransform(
    springConfidence,
    [0, 50, 85],
    ["#38BDF8", "#F59E0B", "#EF4444"]
  )

  const bgColorScale = useTransform(
    springConfidence,
    [0, 50, 85],
    ["rgba(56, 189, 248, 0.05)", "rgba(245, 158, 11, 0.05)", "rgba(239, 68, 68, 0.05)"]
  )

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Risk Assessment Card */}
      <motion.div 
        style={{ 
          borderLeftColor: colorScale,
          backgroundColor: bgColorScale,
          borderColor: `rgba(255, 255, 255, 0.05)`
        }}
        className="glass-panel p-5 border-l-4 transition-shadow duration-1000"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Risk Assessment</h3>
            <div className="flex items-center gap-2">
              <motion.span 
                style={{ color: colorScale }}
                animate={intel.scamType === "Analyzing..." ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-lg font-bold tracking-tight"
              >
                {isInitialState ? "Gathering Context..." : intel.scamType}
              </motion.span>
            </div>
          </div>
          <motion.div 
            style={{ 
              backgroundColor: bgColorScale.get().replace('0.05', '0.15'), // Slightly darker for icon bg
              color: colorScale 
            }}
            className="p-2 rounded-lg transition-colors duration-500"
          >
            {intel.confidence >= 75 && !isInitialState ? <ShieldAlert size={20} /> : <Activity size={20} className={cn(intel.scamType === "Analyzing..." && "animate-pulse")} />}
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Confidence Score</span>
              {isInitialState && (
                <div className="flex items-center gap-1 group relative">
                  <AlertCircle size={10} className="text-primary-light/50" />
                  <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-surface border border-white/10 rounded-lg text-[9px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                    Gathering initial context to establish baseline analysis.
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <AnimatedNumber value={displayConfidence} />
              <span>%</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${displayConfidence}%`,
                backgroundColor: displayConfidence >= 75 ? "#EF4444" : displayConfidence >= 60 ? "#F59E0B" : "#38BDF8"
              }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full transition-colors duration-500"
            />
          </div>
          
          <AnimatePresence>
            {isInitialState && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-slate-400 font-medium italic"
              >
                <div className="w-1 h-1 bg-primary-light rounded-full animate-pulse" />
                Gathering initial context...
              </motion.div>
            )}
          </AnimatePresence>

          {!isInitialState && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Classification:</span>
              <motion.span style={{ color: colorScale }} className="font-bold">{intel.scamType}</motion.span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Counter Summary (Narrative addition) */}
      <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-primary-light" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intel Harvest</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white font-bold">{indicatorCount}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1 h-3 rounded-full transition-all duration-700",
                  i < indicatorCount ? "bg-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Intel Sections */}
      <div className="flex-1 space-y-4">
        <IntelSection 
          icon={<Hash size={16} />} 
          title="UPI Identifiers" 
          items={intel.upiIds}
          accent="text-accent"
        />
        <IntelSection 
          icon={<Smartphone size={16} />} 
          title="Phone Numbers" 
          items={intel.phoneNumbers}
          accent="text-primary-light"
        />
        <IntelSection 
          icon={<LinkIcon size={16} />} 
          title="Phishing Links" 
          items={intel.links}
          accent="text-alert-light"
          isLink
        />
      </div>

      {/* System Status */}
      <div className="glass-panel p-4 bg-white/5 border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Database size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">System Log</span>
        </div>
        <div className="space-y-2 font-mono text-[9px] text-slate-500">
          {Array.isArray(intel.logs) && intel.logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className={cn(
                "opacity-50",
                log.type === 'ok' && "text-accent",
                log.type === 'wait' && "text-primary-light",
                log.type === 'warn' && "text-alert",
                log.type === 'info' && "text-blue-400"
              )}>
                [{log.type.toUpperCase()}]
              </span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const IntelSection = ({ icon, title, items, accent, isLink = false }: any) => {
  return (
    <div className="glass-panel p-4 bg-white/[0.02] border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 rounded-md bg-white/5", accent)}>
          {icon}
        </div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{title}</h4>
        {items.length > 1 && (
          <span className="bg-alert/20 text-alert text-[9px] px-1.5 py-0.5 rounded-full border border-alert/30 font-bold ml-2">
            MULTIPLE
          </span>
        )}
        <span className="ml-auto text-[10px] font-mono text-slate-500">{items.length}</span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-[10px] text-slate-600 italic py-1">No indicators found yet — monitoring conversation</div>
        ) : (
          items.map((item: string) => (
            <motion.div 
              key={item}
              initial={{ x: 20, opacity: 0, filter: 'blur(10px)' }}
              animate={{ 
                x: 0, 
                opacity: 1, 
                filter: 'blur(0px)',
                backgroundColor: ['rgba(255,255,255,0.05)', 'rgba(56,189,248,0.1)', 'rgba(255,255,255,0.05)']
              }}
              transition={{ 
                duration: 0.8,
                backgroundColor: { duration: 2 }
              }}
              layout
              className="flex items-center justify-between group p-2 bg-white/5 rounded border border-transparent hover:border-white/10 transition-colors"
            >
              <span className={cn("text-[11px] font-mono truncate max-w-[180px]", isLink ? "text-accent underline" : "text-white")}>
                {item}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-1 hover:text-white text-slate-500"
                  onClick={() => navigator.clipboard.writeText(item)}
                >
                  <Copy size={12} />
                </button>
                {isLink && (
                  <a 
                    href={item.startsWith('http') ? item : `https://${item}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-white text-slate-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default IntelPanel
