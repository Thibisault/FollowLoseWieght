export type Unit = 'kg' | 'lb'

export type Plan = {
  startDate: string // YYYY-MM-DD
  durationDays: number
  unit: Unit
  startWeightKg: number
  targetWeightKg: number
}

export type Entry = {
  date: string // YYYY-MM-DD
  weightKg: number
}

export type AppState = {
  plan: Plan | null
  entries: Entry[]
}

const KEY = 'flw_state_v1'

function parseISODateMs(s: string): number {
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0)
  return dt.getTime()
}

function diffDays(startISO: string, endISO: string): number {
  const a = parseISODateMs(startISO)
  const b = parseISODateMs(endISO)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { plan: null, entries: [] }
    const parsed = JSON.parse(raw) as any

    const entries = Array.isArray(parsed.entries) ? parsed.entries : []
    if (!parsed.plan) return { plan: null, entries }

    const p = parsed.plan as any
    const unit: Unit = (p.unit === 'lb' || p.unit === 'kg') ? p.unit : 'kg'
    const startDate = String(p.startDate ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10)

    let durationDays = Number(p.durationDays ?? 0)
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      if (p.endDate) {
        durationDays = Math.max(1, diffDays(startDate, String(p.endDate).slice(0, 10)))
      } else {
        durationDays = 30
      }
    }

    const startWeightKg = Number(p.startWeightKg ?? 0) || 0

    let targetWeightKg = Number(p.targetWeightKg ?? NaN)
    if (!Number.isFinite(targetWeightKg)) {
      if (p.targetLossKg != null) {
        const lossKg = Number(p.targetLossKg) || 0
        targetWeightKg = startWeightKg - lossKg
      } else {
        targetWeightKg = startWeightKg
      }
    }

    return {
      plan: {
        startDate,
        durationDays: Math.max(1, Math.round(durationDays)),
        unit,
        startWeightKg: Math.max(0, startWeightKg),
        targetWeightKg: Math.max(0, targetWeightKg),
      },
      entries,
    }
  } catch {
    return { plan: null, entries: [] }
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearState() {
  localStorage.removeItem(KEY)
}
