export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function safeNumber(value: string): number | null {
  const v = value.replace(',', '.').trim()
  if (!v) return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n
}
