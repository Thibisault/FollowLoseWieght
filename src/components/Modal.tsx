import React, { useEffect } from 'react'

export default function Modal(props: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    if (!props.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props.open, props.onClose])

  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 safe-bottom">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={props.onClose} />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0E0E14]/90 shadow-glow">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <div className="text-[15px] font-semibold text-white">{props.title}</div>
          <button
            onClick={props.onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white/80"
          >
            Fermer
          </button>
        </div>
        <div className="px-5 pb-5">{props.children}</div>
      </div>
    </div>
  )
}
