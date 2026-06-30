import { useEffect, useRef, useState } from 'react';
import type { StockData } from '../types';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function useStockWebSocket(tickers: string[]) {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickersRef = useRef(tickers);
  tickersRef.current = tickers;

  useEffect(() => {
    if (tickers.length === 0) {
      setConnected(false);
      setReconnecting(false);
      setStockData({});
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/stocks?tickers=${tickersRef.current.join(',')}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        setStockData(data);
        setConnected(true);
        setReconnecting(false);
      } catch {
        setConnected(false);
        setReconnecting(true);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [tickers]);

  return { stockData, connected, reconnecting };
}
