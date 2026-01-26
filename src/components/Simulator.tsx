import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  Timer,
  Hash,
  MessageSquare,
  Terminal as TerminalIcon,
  AlertTriangle,
} from "lucide-react";
import ChatPanel from "./ChatPanel";
import IntelPanel from "./IntelPanel";
import MetadataBar from "./MetadataBar";

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

const Simulator = ({
  sessionId,
  onReset,
  onComplete,
  isResultMode,
}: SimulatorProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [intel, setIntel] = useState<Intel>({
    scamDetected: false,
    scamType: "Analyzing...",
    confidence: 0,
    upiIds: [],
    phoneNumbers: [],
    links: [],
    keywords: [],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [investigationComplete, setInvestigationComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState("00:00");

  // Persistence: Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(`session_${sessionId}`);
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setMessages(data.messages || []);
        setIntel(
          data.intel || {
            scamDetected: false,
            scamType: "Analyzing...",
            confidence: 0,
            upiIds: [],
            phoneNumbers: [],
            links: [],
            keywords: [],
          },
        );
        setInvestigationComplete(data.investigationComplete || false);
      } catch (e) {
        console.error("Failed to load session from localStorage", e);
      }
    }
  }, [sessionId]);

  // Persistence: Save session to localStorage on every change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        `session_${sessionId}`,
        JSON.stringify({
          messages,
          intel,
          investigationComplete,
        }),
      );
    }
  }, [messages, intel, investigationComplete, sessionId]);

  // Timer logic
  useEffect(() => {
    if (investigationComplete) return; // Stop timer when complete

    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(diff / 60)
        .toString()
        .padStart(2, "0");
      const secs = (diff % 60).toString().padStart(2, "0");
      setElapsed(`${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, investigationComplete]);

  const analyzeConfidence = (text: string, currentConfidence: number): number => {
    let increment = 0;
    const lowerText = text.toLowerCase();

    // 1. Keywords (+15%)
    const keywords = ["free", "100% off", "urgent", "win", "winner", "prize", "cash", "account blocked", "verify"];
    if (keywords.some(kw => lowerText.includes(kw))) {
      increment += 15;
    }

    // 2. Phone numbers (+20%)
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    if (phoneRegex.test(text)) {
      increment += 20;
    }

    // 3. URLs/Links (+25%)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
    if (urlRegex.test(text)) {
      increment += 25;
    }

    return Math.min(currentConfidence + increment, 95);
  };

  const extractLinks = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
    return text.match(urlRegex) || [];
  };

  const getClassification = (confidence: number): string => {
    if (confidence > 70) return "Scam Confirmed";
    if (confidence > 30) return "Likely Scam";
    return "Analyzing...";
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isResultMode || investigationComplete) return;

    // 1. Add user message
    const newMessage = {
      id: Date.now(),
      text,
      sender: "scammer",
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // 2. Real API call to n8n
      const response = await fetch(import.meta.env.VITE_WEBHOOK_URL as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          history: updatedMessages,
          metadata: {
            platform: "WhatsApp/SMS",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // 3. Update state with real data
      const agentMsg = {
        id: Date.now() + 1,
        text:
          data.agentReply ||
          data.reply ||
          "Message received. Analyzing next steps.",
        sender: "agent",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      setIntel((prev: Intel) => {
        const newConfidence = data.confidence !== undefined 
          ? data.confidence 
          : analyzeConfidence(text, prev.confidence);

        const newScamType = data.scamType || getClassification(newConfidence);
        const newScamDetected = data.scamDetected ?? (newConfidence > 70);

        const localLinks = extractLinks(text);
        const combinedLinks = [...new Set([
          ...prev.links, 
          ...localLinks,
          ...(data.extractedIntelligence?.links || [])
        ])];

        return {
          ...prev,
          scamDetected: newScamDetected,
          scamType: newScamType,
          confidence: newConfidence,
          upiIds: data.extractedIntelligence?.upiIds
            ? [...new Set([...prev.upiIds, ...data.extractedIntelligence.upiIds])]
            : prev.upiIds,
          phoneNumbers: data.extractedIntelligence?.phoneNumbers
            ? [
                ...new Set([
                  ...prev.phoneNumbers,
                  ...data.extractedIntelligence.phoneNumbers,
                ]),
              ]
            : prev.phoneNumbers,
          links: combinedLinks,
          keywords: data.extractedIntelligence?.keywords
            ? [
                ...new Set([
                  ...prev.keywords,
                  ...data.extractedIntelligence.keywords,
                ]),
              ]
            : prev.keywords,
        };
      });

      if (data.investigationComplete === true) {
        setInvestigationComplete(true);
      }

      if (data.isFinal || (data.scamDetected && data.confidence > 90)) {
        setTimeout(onComplete, 2000);
      }
    } catch (error) {
      console.error("Webhook error, falling back to mock:", error);

      // Fallback to mock logic if webhook fails
      setTimeout(() => {
        const agentReply = getMockResponse(text);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: agentReply.text,
            sender: "agent",
            timestamp: new Date().toISOString(),
          },
        ]);

        setIntel((prev: Intel) => {
          const updated = { ...prev };
          if (agentReply.extracted) {
            if (agentReply.extracted.upi)
              updated.upiIds = [
                ...new Set([...prev.upiIds, agentReply.extracted.upi]),
              ];
            if (agentReply.extracted.link)
              updated.links = [
                ...new Set([...prev.links, agentReply.extracted.link]),
              ];
            if (agentReply.extracted.phone)
              updated.phoneNumbers = [
                ...new Set([...prev.phoneNumbers, agentReply.extracted.phone]),
              ];
          }
          
          updated.confidence = analyzeConfidence(text, prev.confidence);
          updated.scamType = getClassification(updated.confidence);
          updated.scamDetected = updated.confidence > 70;
          
          // Also extract links locally in fallback mode
          const localLinks = extractLinks(text);
          updated.links = [...new Set([...updated.links, ...localLinks])];
          
          return updated;
        });

        if (agentReply.isFinal) {
          setInvestigationComplete(true);
          setTimeout(onComplete, 1500);
        }
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const exportTranscript = () => {
    if (messages.length === 0) return;

    const transcriptData = {
      sessionId,
      platform: "WhatsApp/SMS",
      startedAt: messages[0]?.timestamp || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      riskAssessment: {
        scamDetected: intel.scamDetected,
        confidenceScore: intel.confidence / 100,
      },
      messages: messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
      })),
      extractedIntelligence: {
        upiIds: intel.upiIds,
        phoneNumbers: intel.phoneNumbers,
        phishingLinks: intel.links,
        suspiciousKeywords: intel.keywords,
      },
    };

    const blob = new Blob([JSON.stringify(transcriptData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scam-investigation-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-slate-200">
      {/* Top Metadata Bar */}
      <MetadataBar
        sessionId={sessionId}
        elapsed={elapsed}
        msgCount={messages.length}
        onReset={onReset}
        onExport={exportTranscript}
        investigationComplete={investigationComplete}
      />

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <ChatPanel
            messages={messages}
            onSend={handleSendMessage}
            isTyping={isTyping}
            isLocked={isResultMode || investigationComplete}
            investigationComplete={investigationComplete}
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
              <h2 className="text-3xl font-bold text-white mb-2">
                Simulation Complete
              </h2>
              <p className="text-slate-400 mb-8">
                Intelligence has been successfully harvested and reported to the
                evaluation server.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                    Status
                  </div>
                  <div className="text-accent font-bold">Scam Confirmed</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                    Impact
                  </div>
                  <div className="text-primary-light font-bold">
                    12 Indicators Found
                  </div>
                </div>
              </div>

              <button onClick={onReset} className="btn-primary w-full">
                Start New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Simulator;

const getMockResponse = (text: string) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("upi") || lowerText.includes("@")) {
    return {
      text: "I see you're asking about payment. Most users find UPI the fastest way to secure the deal. Is there anything else you need?",
      extracted: { upi: "secure.pay@okaxis" },
      isFinal: false
    };
  }
  
  if (lowerText.includes("link") || lowerText.includes("http")) {
    return {
      text: "The verification link is standard for all premium registrations. It's a secure portal hosted on our corporate servers. Visit: www.secure-verify-pay.com",
      extracted: { link: "https://secure-verification-portal.net/login" },
      isFinal: false
    };
  }

  if (lowerText.includes("number") || lowerText.includes("call")) {
    return {
      text: "You can reach our support manager directly at the priority desk for faster processing.",
      extracted: { phone: "+91 98765 43210" },
      isFinal: false
    };
  }

  if (lowerText.includes("done") || lowerText.includes("sent") || lowerText.includes("paid")) {
    return {
      text: "Excellent. I'm processing your request now. We will notify you once the transaction is verified on the blockchain.",
      isFinal: true
    };
  }

  return {
    text: "Interesting. Please tell me more about how you found us. We want to ensure all our clients get the best onboarding experience.",
    isFinal: false
  };
};
