import React from 'react'

export default function Chip(props: { children: React.ReactNode; tone?: 'pink' | 'slate' | 'warn' }) {
  const tone = props.tone ?? 'slate'
  const cls =
    tone === 'pink'
      ? 'bg-white/10 text-white border-white/10'
      : tone === 'warn'
        ? 'bg-red-500/10 text-red-100 border-red-500/20'
        : 'bg-white/5 text-white/80 border-white/10'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] ${cls}`}>
      {props.children}
    </span>
  )
}
