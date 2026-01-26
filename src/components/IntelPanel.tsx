import { motion } from 'framer-motion'
import { AlertCircle, ShieldCheck, Activity, Database, Smartphone, Link as LinkIcon, Hash, Copy, ExternalLink, ShieldAlert } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  };
  isResultMode: boolean;
}

const IntelPanel = ({ intel, isResultMode }: IntelPanelProps) => {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Risk Assessment Card */}
      <div className={cn(
        "glass-panel p-5 border-l-4 transition-all duration-500",
        intel.scamDetected ? "border-l-alert bg-alert/5" : "border-l-primary bg-primary/5"
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Risk Assessment</h3>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-lg font-bold",
                intel.scamDetected ? "text-alert" : "text-primary-light"
              )}>
                {intel.scamDetected ? 'Scam Detected' : 'Analyzing...'}
              </span>
            </div>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            intel.scamDetected ? "bg-alert/10 text-alert" : "bg-primary/10 text-primary-light"
          )}>
            {intel.scamDetected ? <ShieldAlert size={20} /> : <Activity size={20} className="animate-pulse" />}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Confidence Score</span>
            <span>{intel.confidence}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${intel.confidence}%` }}
              className={cn(
                "h-full rounded-full transition-colors duration-500",
                intel.confidence > 70 ? "bg-alert" : "bg-primary-light"
              )}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Classification:</span>
            <span className="text-white font-medium">{intel.scamType}</span>
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
          <div className="flex gap-2">
            <span className="text-accent opacity-50">[OK]</span>
            <span>NEURAL_ENGINE_ACTIVE</span>
          </div>
          <div className="flex gap-2">
            <span className="text-primary-light opacity-50">[WAIT]</span>
            <span>LISTENING_FOR_INTENT</span>
          </div>
          {intel.scamDetected && (
            <div className="flex gap-2">
              <span className="text-alert opacity-50">[WARN]</span>
              <span className="text-alert-light">PAYMENT_TRIGGER_IDENTIFIED</span>
            </div>
          )}
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
        <span className="ml-auto text-[10px] font-mono text-slate-500">{items.length}</span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-[10px] text-slate-600 italic py-1">No indicators found yet...</div>
        ) : (
          items.map((item: string, i: number) => (
            <motion.div 
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center justify-between group p-2 bg-white/5 rounded border border-transparent hover:border-white/10 transition-colors"
            >
              <span className={cn("text-[11px] font-mono truncate max-w-[180px]", isLink ? "text-blue-400 underline" : "text-white")}>
                {item}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:text-white text-slate-500">
                  <Copy size={12} />
                </button>
                {isLink && (
                  <button className="p-1 hover:text-white text-slate-500">
                    <ExternalLink size={12} />
                  </button>
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
