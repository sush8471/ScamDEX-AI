import { Terminal, Timer, Hash, MessageSquare, RotateCcw, Download, FileJson, ShieldCheck } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface MetadataBarProps {
  sessionId: string;
  elapsed: string;
  msgCount: number;
  onReset: () => void;
  onExport: () => void;
  investigationComplete: boolean;
  indicatorCount: number;
  isJudge?: boolean;
}

const MetadataBar = ({ sessionId, elapsed, msgCount, onReset, onExport, investigationComplete, indicatorCount, isJudge = false }: MetadataBarProps) => {
  return (
    <div className="bg-surface/80 border-b border-white/5 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-primary-light" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Session</span>
          <span className="text-sm font-mono text-white truncate max-w-[120px]">{sessionId.split('-')[0]}...</span>
        </div>
        
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Timer size={16} className="text-primary-light" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Duration</span>
          <span className="text-sm font-mono text-white">{elapsed}</span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary-light" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Messages</span>
          <span className="text-sm font-mono text-white">{msgCount}</span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden lg:block" />

        <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          <Hash size={14} className="text-accent" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest whitespace-nowrap">Indicators Collected</span>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-mono font-bold",
              indicatorCount >= 5 ? "text-alert" : "text-white"
            )}>
              {indicatorCount}
            </span>
            <span className="text-xs font-mono text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-500">5</span>
          </div>
          {indicatorCount > 0 && (
            <div className="flex gap-0.5 ml-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-3 rounded-[1px] transition-all duration-500",
                    i < indicatorCount 
                      ? (indicatorCount >= 5 ? "bg-alert" : "bg-accent") 
                      : "bg-white/10"
                  )} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {investigationComplete ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Analysis Finalized</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Integration</span>
          </div>
        )}

        {isJudge && (
          <button 
            onClick={onExport}
            disabled={msgCount === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed group"
            title="Export Transcript"
          >
            <FileJson size={16} className="text-primary-light group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Export JSON</span>
          </button>
        )}
        
        <button 
          onClick={onReset}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Reset Session"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  )
}

export default MetadataBar
