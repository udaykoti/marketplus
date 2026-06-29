import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { X } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Props {
  tickers: string[];
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];

export default function CompetitorRadar({ tickers, onClose }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (tickers.length < 2) return;
      setLoading(true);
      try {
        const { data: compareData } = await axios.get(`${API}/api/tickers/compare?tickers=${tickers.join(',')}`);
        const rawTickers = compareData.tickers || {};

        const dimensions = ['Momentum', 'Sentiment', 'Volume Activity', 'Volatility', '52-Week Perf'];

        const chartData = dimensions.map((dim) => {
          const entry: any = { dimension: dim };
          for (const [t, info] of Object.entries(rawTickers)) {
            const d = info as any;
            switch (dim) {
              case 'Momentum':
                entry[t] = Math.min(Math.max(((d.changePercent || 0) + 10) / 20 * 100, 0), 100);
                break;
              case 'Sentiment':
                entry[t] = 50;
                break;
              case 'Volume Activity':
                entry[t] = Math.min((d.volume || 0) / 10000000 * 100, 100);
                break;
              case 'Volatility': {
                const prices = (d.history || []).map((h: any) => h.price).filter((p: number) => p > 0);
                if (prices.length > 1) {
                  const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
                  const variance = prices.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / prices.length;
                  const stdDev = Math.sqrt(variance);
                  const normalized = Math.max(100 - (stdDev / mean) * 1000, 0);
                  entry[t] = Math.min(normalized, 100);
                } else {
                  entry[t] = 50;
                }
                break;
              }
              case '52-Week Perf': {
                const infoData = d.info || {};
                const wkLow = infoData.week52Low || 0;
                const current = d.price || 0;
                entry[t] = wkLow > 0 ? Math.min((current / wkLow) * 50, 100) : 50;
                break;
              }
            }
          }
          return entry;
        });
        setData(chartData);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tickers]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#16162a] rounded-xl border border-[#2a2a4e] p-6 w-[600px] max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Competitor Comparison</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid stroke="#2a2a4e" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              {tickers.slice(0, 8).map((t, i) => (
                <Radar
                  key={t}
                  name={t}
                  dataKey={t}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.1}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
