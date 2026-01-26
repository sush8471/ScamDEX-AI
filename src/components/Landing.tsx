import { motion } from 'framer-motion'
import { Shield, Zap, Target, ArrowRight, ShieldAlert } from 'lucide-react'

interface LandingProps {
  onStart: () => void;
}

const Landing = ({ onStart }: LandingProps) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="z-10 text-center max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-mono mb-8">
          <Shield size={14} />
          <span>v2.4.0 Deployment Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-sans tracking-tight mb-6 text-white">
          Agentic <span className="text-primary-light">Honey-Pot</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered autonomous scam engagement and continuous intelligence extraction system.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={onStart}
            className="btn-primary text-lg px-8 py-4 group"
          >
            Start Simulation
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="btn-outline text-lg px-8 py-4">
            System Docs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { 
              icon: <ShieldAlert className="text-primary-light" />, 
              title: "Detect Scam Intent", 
              desc: "Deep-heuristic analysis to identify malicious patterns in real-time." 
            },
            { 
              icon: <Zap className="text-accent-light" />, 
              title: "Autonomous Engagement", 
              desc: "AI agents lead scammers into digital traps to keep them occupied." 
            },
            { 
              icon: <Target className="text-primary-light" />, 
              title: "Intelligence Extraction", 
              desc: "Automatically harvest UPI IDs, bank details, and phishing endpoints." 
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-panel p-6 hover:border-primary/30 transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="mt-20 z-10 text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
        Secure Operations Center | ScamDEX AI Intelligence
      </div>
    </div>
  )
}

export default Landing
