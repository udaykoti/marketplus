import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  tickers: string[];
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

export default function TickerSearch({ tickers, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('');
  const [warning, setWarning] = useState('');

  const handleAdd = () => {
    const val = input.trim().toUpperCase();
    if (!val) return;
    if (val.length < 1 || val.length > 5) {
      setWarning('Ticker must be 1-5 characters');
      return;
    }
    if (tickers.includes(val)) {
      setWarning(`${val} is already in your watchlist`);
      return;
    }
    if (tickers.length >= 10) {
      setWarning('Maximum 10 tickers allowed');
      return;
    }
    onAdd(val);
    setInput('');
    setWarning('');
  };

  return (
    <div>
      <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg p-2 border border-[#2a2a3e]">
        <Search size={18} className="text-gray-400 ml-1" />
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setWarning(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Search ticker (e.g. TSLA, AAPL)"
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {warning && <p className="text-red-400 text-xs mt-1">{warning}</p>}
      {tickers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tickers.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 bg-[#252540] text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium border border-[#3a3a5e]"
            >
              {t}
              <button onClick={() => onRemove(t)} className="hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
