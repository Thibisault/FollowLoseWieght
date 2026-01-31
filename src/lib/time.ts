export function todayISO(): string {
  const d = new Date()
  return toISODate(d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0)
}

export function diffDays(startISO: string, endISO: string): number {
  const a = parseISODate(startISO).getTime()
  const b = parseISODate(endISO).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function formatFrShort(iso: string): string {
  const d = parseISODate(iso)
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
  return fmt.format(d)
}
