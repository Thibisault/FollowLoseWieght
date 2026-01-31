import React from 'react'

export default function Chip(props: { children: React.ReactNode; tone?: 'pink' | 'slate' }) {
  const tone = props.tone ?? 'slate'
  const cls = tone === 'pink' ? 'bg-white/10 text-white border-white/10' : 'bg-white/5 text-white/80 border-white/10'
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] ${cls}`}>{props.children}</span>
}
