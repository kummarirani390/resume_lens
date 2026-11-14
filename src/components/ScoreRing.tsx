import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animate?: boolean;
}

export function getScoreTier(score: number): {
  label: string;
  strokeColor: string;
  textColorClass: string;
} {
  if (score >= 80) {
    return {
      label: 'Strong Match',
      strokeColor: '#0d9488',
      textColorClass: 'text-teal-700 dark:text-teal-400',
    };
  }
  if (score >= 60) {
    return {
      label: 'Good Potential',
      strokeColor: '#d97706',
      textColorClass: 'text-amber-700 dark:text-amber-400',
    };
  }
  return {
    label: 'Needs Tailoring',
    strokeColor: '#dc2626',
    textColorClass: 'text-red-700 dark:text-red-400',
  };
}

export function ScoreRing({
  score,
  size = 136,
  strokeWidth = 10,
  label,
  animate = true,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const [displayScore, setDisplayScore] = useState(animate ? 0 : clamped);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(clamped);
      return;
    }

    setDisplayScore(0);
    const frame = requestAnimationFrame(() => {
      setDisplayScore(clamped);
    });
    return () => cancelAnimationFrame(frame);
  }, [clamped, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const tier = getScoreTier(clamped);

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label}: ${clamped} out of 100` : `Match score: ${clamped} out of 100`}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tier.strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 750ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
            {clamped}
          </span>
          <span className="text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            / 100
          </span>
        </div>
      </div>
      {label ? (
        <span className={`mt-2.5 text-xs font-semibold ${tier.textColorClass}`}>{label}</span>
      ) : (
        <span className={`mt-2.5 text-xs font-semibold ${tier.textColorClass}`}>{tier.label}</span>
      )}
    </div>
  );
}
