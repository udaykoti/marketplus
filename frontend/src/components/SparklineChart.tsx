import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { HistoryPoint } from '../types';

interface Props {
  data: HistoryPoint[];
}

export default function SparklineChart({ data }: Props) {
  if (!data || data.length < 2) return <div className="h-[60px]" />;

  const first = data[0].price;
  const last = data[data.length - 1].price;
  const color = last >= first ? '#22c55e' : '#ef4444';

  return (
    <div className="h-[60px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
