export interface StockData {
  ticker: string;
  price: number;
  changePercent: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  timestamp?: string;
  anomaly?: AnomalyData | null;
  error?: string;
}

export interface AnomalyData {
  type: string;
  severity: string;
  message: string;
}

export interface SentimentData {
  score: number;
  headlines: { title: string; url: string }[];
  label?: string;
  error?: string;
}

export interface HistoryPoint {
  date: string;
  price: number;
}

export interface TickerInfo {
  name: string;
  sector: string;
  marketCap: number;
  peRatio: number;
  week52High: number;
  week52Low: number;
}
