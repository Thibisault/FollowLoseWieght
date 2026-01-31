import React from 'react'
import type { Entry } from '../lib/storage'
import { clamp } from '../lib/math'

export default function Sparkline(props: { entries: Entry[] }) {
  const w = 280
  const h = 64
  const pad = 8

  const pts = props.entries
  if (!pts.length) {
    return <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />
  }

  const ys = pts.map(p => p.weightKg)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = Math.max(0.001, maxY - minY)

  const step = (w - pad * 2) / Math.max(1, pts.length - 1)

  const d = pts
    .map((p, i) => {
      const x = pad + i * step
      const t = (p.weightKg - minY) / span
      const y = pad + (1 - clamp(t, 0, 1)) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff4fd8" stopOpacity="0.95" />
            <stop offset="1" stopColor="#6d5cff" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff4fd8" stopOpacity="0.18" />
            <stop offset="1" stopColor="#6d5cff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#spark)" strokeWidth="3.5" strokeLinecap="round" />
        <path d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#fill)" />
      </svg>
    </div>
  )
}
