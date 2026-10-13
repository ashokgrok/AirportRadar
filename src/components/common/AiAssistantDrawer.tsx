import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Lock, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string | null;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citedKpis?: string[];
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeScenarioId
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello ${currentUser.name}. I am the AIONOS Airport KPI Intelligence Assistant. I query only through the governed semantic layer under your ${currentUser.department} security scope (${currentUser.scopeType}). How can I assist you with operational metrics today?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Why did OTP drop during the Winter Fog scenario?',
    'What was the impact of the Terminal 1 BHS sorter jam?',
    'How do T1 and T2 security screening wait times compare?',
    'What is our current regulated AERA service compliance?'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: 'Just now'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let responseText = '';
      let citedKpis: string[] = [];

      const lower = q.toLowerCase();
      if (lower.includes('fog') || lower.includes('otp')) {
        responseText = `During the Winter Fog & Low Visibility period (worst day 03 Jan 2026), CAT III-B procedures reduced declared runway arrival throughput from 58 to 34 movements/hour. This triggered an OTP-15 decline to 41.2% (Target: 87.0%). Average additional taxi-out time rose to 16.4 minutes. Controllability analysis shows 78% of delay minutes were coded to weather (IATA code 71/75) rather than airport infrastructure.`;
        citedKpis = ['PUN-01', 'PUN-02', 'ASD-01', 'ASD-02'];
      } else if (lower.includes('bhs') || lower.includes('bag')) {
        responseText = `On 14 Mar 2026, the 2h 40min mechanical jam on Terminal 1 Sorter 2 caused BHS system availability to dip to 89.2% for the day. First-bag delivery time climbed to 34.5 minutes (Target: 12.0 min), and mishandled bags surged to 11.4 per 1,000 passengers across departing transfer banks.`;
        citedKpis = ['BAG-01', 'BAG-02', 'BAG-03', 'AST-01'];
      } else if (lower.includes('security') || lower.includes('wait') || lower.includes('queue')) {
        responseText = `Under baseline operations, Terminal 2 Central Security achieves a P90 wait of 9.2 minutes (Target: 10.0 min) with 26 active lanes. Terminal 1 Alpha Checkpoint is operating at 10.8 minutes with 16 lanes. During the Security Staffing Shortfall scenario, Terminal 2 P90 spiked to 28.5 minutes due to a 24% screener absenteeism rate.`;
        citedKpis = ['PAX-01', 'WFM-01', 'GOV-01'];
      } else {
        responseText = `Based on the latest governed facts for AIONOS Demo International (ZZA), overall airport operations are operating within normal calibration bands. All queries are filtered according to your role (${currentUser.department}) with row-level security and column masking active.`;
        citedKpis = ['PUN-01', 'ASD-01', 'PAX-01', 'COM-01'];
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        citedKpis,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Governed KPI Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                FR-7
              </span>
            </h3>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Scope: {currentUser.department} ({currentUser.scopeType})</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested prompts */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-mono text-slate-400 w-full mb-0.5">Quick questions:</span>
        {sampleQuestions.slice(0, 2).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] text-left px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Conversation Stream */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <p>{m.text}</p>
              {m.citedKpis && m.citedKpis.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Cited Metrics:</span>
                  {m.citedKpis.map(code => (
                    <span
                      key={code}
                      className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-semibold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 text-slate-400 font-mono text-xs animate-pulse">
              Querying semantic layer...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask KPI question as ${currentUser.name}...`}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
