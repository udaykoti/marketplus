import { memo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { StockData, HistoryPoint } from '../types';
import SparklineChart from './SparklineChart';

interface Props {
  data: StockData;
  history: HistoryPoint[];
}

function StockCardInner({ data, history }: Props) {
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [prevPrice, setPrevPrice] = useState(data.price);

  useEffect(() => {
    if (data.price !== prevPrice) {
      setFlash(data.price > prevPrice ? 'green' : 'red');
      setPrevPrice(data.price);
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [data.price, prevPrice]);

  const isPositive = data.changePercent >= 0;
  const volFormatted = data.volume?.toLocaleString() ?? 'N/A';

  const bgFlash = flash === 'green'
    ? 'rgba(34,197,94,0.15)'
    : flash === 'red'
    ? 'rgba(239,68,68,0.15)'
    : 'transparent';

  return (
    <div
      className="relative bg-[#16162a] rounded-xl border border-[#2a2a4e] p-4 transition-colors duration-300"
      style={{ backgroundColor: bgFlash }}
    >
      {data.anomaly && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
          <AlertTriangle size={10} />
          ALERT
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-white font-bold text-lg">{data.ticker}</span>
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp size={16} className="text-green-400" />
          ) : (
            <TrendingDown size={16} className="text-red-400" />
          )}
          <span className={`font-semibold text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{data.changePercent}%
          </span>
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        ${data.price?.toFixed(2) ?? 'N/A'}
      </div>

      <div className="text-xs text-gray-400 mb-2">
        Vol: {volFormatted}
      </div>

      <SparklineChart data={history} />
    </div>
  );
}

const StockCard = memo(StockCardInner);
export default StockCard;
