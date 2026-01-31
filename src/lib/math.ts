export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function safeNumber(value: string): number | null {
  const v = value.replace(',', '.').trim()
  if (!v) return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n
}

export function fmt1(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(n)
}

export function fmt2(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n)
}
