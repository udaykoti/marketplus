import { useState, useRef, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SUGGESTIONS = [
  'Why is TSLA dropping?',
  'Compare my watchlist',
  'What is the market sentiment today?',
  'Any anomalies I should know about?',
];

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface Props {
  tickers: string[];
}

export default function AIChatPanel({ tickers }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/api/ai/chat`, {
        question: text.trim(),
        tickers,
      });
      const aiMsg: Message = {
        role: 'ai',
        text: data.response || data.error || 'No response',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error connecting to AI service' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16162a] rounded-xl border border-[#2a2a4e] flex flex-col h-[400px]">
      <div className="flex items-center gap-2 p-3 border-b border-[#2a2a4e]">
        <Zap size={16} className="text-yellow-400" />
        <span className="text-sm font-semibold text-gray-200">AI Market Copilot</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="block w-full text-left text-xs bg-[#1f1f3a] hover:bg-[#2a2a4e] text-blue-300 px-3 py-2 rounded-lg transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-[#252540] text-gray-200 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#252540] rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse">.</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-[#2a2a4e]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about the market..."
            className="flex-1 bg-[#1a1a2e] text-white placeholder-gray-500 text-sm rounded-lg px-3 py-2 outline-none border border-[#2a2a3e] focus:border-blue-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
