import React from 'react'
import { round1 } from '../lib/math'

export default function ProgressRing(props: {
  value: number // 0..1
  label: string
  sub?: string
}) {
  const v = Math.max(0, Math.min(1, props.value))
  const size = 112
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[22px] font-semibold tracking-tight text-white">{round1(v * 100)}%</div>
        <div className="text-[12px] text-white/60">{props.label}</div>
        {props.sub ? <div className="mt-0.5 text-[11px] text-white/45">{props.sub}</div> : null}
      </div>
    </div>
  )
}
