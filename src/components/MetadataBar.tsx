import { Terminal, Timer, Hash, MessageSquare, RotateCcw } from 'lucide-react'

interface MetadataBarProps {
  sessionId: string;
  elapsed: string;
  msgCount: number;
  onReset: () => void;
}

const MetadataBar = ({ sessionId, elapsed, msgCount, onReset }: MetadataBarProps) => {
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
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Integration</span>
        </div>
        
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
