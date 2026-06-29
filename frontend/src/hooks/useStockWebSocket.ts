import { useEffect, useRef, useState, useCallback } from 'react';
import type { StockData } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function useStockWebSocket(tickers: string[]) {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const tickersRef = useRef(tickers);
  tickersRef.current = tickers;

  const connect = useCallback(() => {
    if (tickersRef.current.length === 0) return;

    const ws = new WebSocket(`${WS_URL}/ws/stocks`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReconnecting(false);
      ws.send(JSON.stringify({ tickers: tickersRef.current }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStockData((prev) => ({ ...prev, ...data }));
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setReconnecting(true);
      setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ tickers }));
    }
  }, [tickers]);

  return { stockData, connected, reconnecting };
}
