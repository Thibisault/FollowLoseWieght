import React from 'react'

export default function ProgressRing(props: { value: number }) {
  const v = Math.max(0, Math.min(1, props.value))
  const size = 92
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * v
  const gap = c - dash

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff4fd8" />
            <stop offset="1" stopColor="#6d5cff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[13px] font-semibold tabular-nums text-white">{Math.round(v * 100)}%</div>
      </div>
    </div>
  )
}
