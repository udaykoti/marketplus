import { useMemo } from 'react';

interface Props {
  avgSentiment: number;
  avgChange: number;
  volumeDeviation: number;
}

const ZONES = [
  { min: 0, max: 20, label: 'Extreme Fear', color: '#dc2626' },
  { min: 20, max: 40, label: 'Fear', color: '#f97316' },
  { min: 40, max: 60, label: 'Neutral', color: '#eab308' },
  { min: 60, max: 80, label: 'Greed', color: '#22c55e' },
  { min: 80, max: 100, label: 'Extreme Greed', color: '#16a34a' },
];

export default function FearGreedMeter({ avgSentiment, avgChange, volumeDeviation }: Props) {
  const score = useMemo(() => {
    const s1 = Math.min(avgSentiment, 100);
    const s2 = Math.min(Math.max(((avgChange + 5) / 10) * 100, 0), 100);
    const s3 = Math.min(volumeDeviation * 10, 100);
    return Math.round((s1 * 0.4 + s2 * 0.3 + s3 * 0.3));
  }, [avgSentiment, avgChange, volumeDeviation]);

  const zone = ZONES.find((z) => score >= z.min && score <= z.max) ?? ZONES[2];
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="bg-[#16162a] rounded-xl border border-[#2a2a4e] p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Fear & Greed Index</h3>
      <div className="flex flex-col items-center">
        <svg width="200" height="120" viewBox="0 0 200 120">
          <defs>
            {ZONES.map((z) => (
              <linearGradient key={z.label} id={`grad-${z.label}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={z.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={z.color} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {ZONES.map((z) => {
            const startAngle = ((z.min - 50) / 100) * 180;
            const endAngle = ((z.max - 50) / 100) * 180;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const r = 80;
            const cx = 100;
            const cy = 105;

            const x1 = cx + r * Math.sin(startRad);
            const y1 = cy - r * Math.cos(startRad);
            const x2 = cx + r * Math.sin(endRad);
            const y2 = cy - r * Math.cos(endRad);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;

            return (
              <path
                key={z.label}
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={z.color}
                strokeWidth="12"
                strokeLinecap="butt"
                opacity="0.6"
              />
            );
          })}

          <circle cx="100" cy="105" r="4" fill={zone.color} />

          <line
            x1="100"
            y1="105"
            x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
            y2={105 + 55 * Math.sin((angle * Math.PI) / 180)}
            stroke={zone.color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <div className="text-3xl font-bold mt-1" style={{ color: zone.color }}>
          {score}
        </div>
        <div className="text-sm font-medium" style={{ color: zone.color }}>
          {zone.label}
        </div>
      </div>
    </div>
  );
}
