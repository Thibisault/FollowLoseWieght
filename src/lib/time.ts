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

export function daysBetweenInclusive(startISO: string, endISO: string): number {
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  const ms = end.getTime() - start.getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, days)
}

export function daysUntil(endISO: string, fromISO: string): number {
  const from = parseISODate(fromISO)
  const end = parseISODate(endISO)
  const ms = end.getTime() - from.getTime()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

export function formatFr(iso: string): string {
  const d = parseISODate(iso)
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  return fmt.format(d)
}
