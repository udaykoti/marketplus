import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Activity, GitCompare } from 'lucide-react';
import { useStockWebSocket } from './hooks/useStockWebSocket';
import { useAlerts } from './context/AlertContext';
import TickerSearch from './components/TickerSearch';
import StockCard from './components/StockCard';
import AIChatPanel from './components/AIChatPanel';
import SentimentPanel from './components/SentimentPanel';
import FearGreedMeter from './components/FearGreedMeter';
import CompetitorRadar from './components/CompetitorRadar';
import AlertToast from './components/AlertToast';
import type { HistoryPoint, StockData } from './types';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function App() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [histories, setHistories] = useState<Record<string, HistoryPoint[]>>({});
  const [showRadar, setShowRadar] = useState(false);
  const { stockData, connected, reconnecting } = useStockWebSocket(tickers);
  const { addAlert } = useAlerts();
  const prevAnomalies = useRef<Set<string>>(new Set());

  const addTicker = useCallback((t: string) => {
    setTickers((prev) => [...prev, t]);
  }, []);

  const removeTicker = useCallback((t: string) => {
    setTickers((prev) => prev.filter((x) => x !== t));
    setHistories((prev) => {
      const next = { ...prev };
      delete next[t];
      return next;
    });
  }, []);

  useEffect(() => {
    tickers.forEach(async (t) => {
      if (histories[t]) return;
      try {
        const { data } = await axios.get(`${API}/api/stock/${t}/history`);
        setHistories((prev) => ({ ...prev, [t]: data.history || [] }));
      } catch {
        setHistories((prev) => ({ ...prev, [t]: [] }));
      }
    });
  }, [tickers]);

  useEffect(() => {
    for (const [t, d] of Object.entries(stockData)) {
      const s = d as StockData;
      if (s.anomaly && s.anomaly.message) {
        const key = `${t}-${s.anomaly.message}`;
        if (!prevAnomalies.current.has(key)) {
          prevAnomalies.current.add(key);
          addAlert(t, s.anomaly.message, s.anomaly.severity);
        }
      }
    }
  }, [stockData, addAlert]);

  const sentimentScore = tickers.length > 0
    ? tickers.reduce((sum, t) => {
        const d = stockData[t] as StockData | undefined;
        return sum + (d ? Math.min(Math.max(((d.changePercent || 0) + 10) / 20 * 100, 0), 100) : 50);
      }, 0) / tickers.length
    : 50;

  const avgChange = tickers.length > 0
    ? tickers.reduce((sum, t) => {
        const d = stockData[t] as StockData | undefined;
        return sum + (d?.changePercent ?? 0);
      }, 0) / tickers.length
    : 0;

  const volDev = tickers.length > 0
    ? tickers.reduce((sum, t) => {
        const d = stockData[t] as StockData | undefined;
        return sum + (d ? Math.abs(d.changePercent || 0) / 10 : 0);
      }, 0) / tickers.length
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-[#2a2a4e] bg-[#0f0f1a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={22} className="text-blue-400" />
          <span className="text-white font-bold text-lg tracking-tight">MarketPulse AI</span>
        </div>
        <div className="flex items-center gap-4">
          {tickers.length >= 2 && (
            <button
              onClick={() => setShowRadar(true)}
              className="flex items-center gap-1 text-xs text-gray-300 hover:text-white bg-[#1a1a2e] px-3 py-1.5 rounded-lg border border-[#2a2a3e] transition-colors"
            >
              <GitCompare size={14} />
              Compare
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              reconnecting ? 'bg-yellow-400 animate-pulse' : connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-gray-400">
              {reconnecting ? 'Reconnecting...' : connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="mb-6 max-w-md">
          <TickerSearch tickers={tickers} onAdd={addTicker} onRemove={removeTicker} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tickers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Activity size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">Welcome to MarketPulse AI</p>
                <p className="text-sm mt-1">Add tickers above to start tracking live market data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickers.map((t) => {
                  const data = stockData[t] as StockData | undefined;
                  const fallback: StockData = {
                    ticker: t, price: 0, changePercent: 0, volume: 0,
                  };
                  return (
                    <StockCard
                      key={t}
                      data={data || fallback}
                      history={histories[t] || []}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <AIChatPanel tickers={tickers} />
            <SentimentPanel tickers={tickers} />
            {tickers.length > 0 && (
              <FearGreedMeter
                avgSentiment={sentimentScore}
                avgChange={avgChange}
                volumeDeviation={volDev}
              />
            )}
          </div>
        </div>
      </div>

      <AlertToast />
      {showRadar && <CompetitorRadar tickers={tickers} onClose={() => setShowRadar(false)} />}
    </div>
  );
}

export default App;
