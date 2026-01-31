export type Plan = {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  startWeightKg: number
  targetLossKg: number
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

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { plan: null, entries: [] }
    const parsed = JSON.parse(raw) as AppState
    return {
      plan: parsed.plan ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
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
