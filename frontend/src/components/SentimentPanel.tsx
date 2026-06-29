import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import axios from 'axios';
import type { SentimentData } from '../types';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Props {
  tickers: string[];
}

export default function SentimentPanel({ tickers }: Props) {
  const [sentiments, setSentiments] = useState<Record<string, SentimentData>>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');

  const fetchSentiments = useCallback(async () => {
    if (tickers.length === 0) return;
    setLoading(true);
    const results: Record<string, SentimentData> = {};
    await Promise.all(
      tickers.map(async (t) => {
        try {
          const { data } = await axios.get(`${API}/api/stock/${t}/sentiment`);
          results[t] = data;
        } catch {
          results[t] = { score: 50, headlines: [], error: 'Failed' };
        }
      })
    );
    setSentiments(results);
    if (!selected && tickers.length > 0) setSelected(tickers[0]);
    setLoading(false);
  }, [tickers]);

  useEffect(() => {
    fetchSentiments();
  }, [fetchSentiments]);

  const currentSentiment = selected ? sentiments[selected] : null;

  const getBarColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-[#16162a] rounded-xl border border-[#2a2a4e] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Sentiment Analysis</h3>
        <button onClick={fetchSentiments} disabled={loading} className="text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && tickers.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-[#252540] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {tickers.map((t) => {
            const s = sentiments[t];
            const score = s?.score ?? 50;
            return (
              <button
                key={t}
                onClick={() => setSelected(t)}
                className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                  selected === t ? 'bg-[#252540]' : 'hover:bg-[#1f1f3a]'
                }`}
              >
                <span className="text-xs font-medium text-gray-300 w-10">{t}</span>
                <div className="flex-1 h-2 bg-[#252540] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{score}</span>
              </button>
            );
          })}
        </div>
      )}

      {currentSentiment && (
        <div>
          <div className={`text-xs font-medium mb-2 ${
            currentSentiment.score < 40 ? 'text-red-400' : currentSentiment.score < 60 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {currentSentiment.label || (currentSentiment.score < 40 ? 'Bearish' : currentSentiment.score < 60 ? 'Neutral' : 'Bullish')}
          </div>
          {currentSentiment.error && (
            <p className="text-xs text-red-400">{currentSentiment.error}</p>
          )}
          <div className="space-y-1.5">
            {(currentSentiment.headlines || []).slice(0, 3).map((h, i) => (
              <a
                key={i}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1 text-xs text-gray-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={10} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{h.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
