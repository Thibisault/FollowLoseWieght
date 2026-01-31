export type Unit = 'kg' | 'lb'

export type Plan = {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  /** Display + input unit chosen by the user (internally stored in kg). */
  unit: Unit
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

    // Backward compatibility for older saves (no unit)
    const plan = parsed.plan as any
    const unit = (plan?.unit === 'lb' || plan?.unit === 'kg') ? plan.unit : 'kg'

    return {
      plan: parsed.plan
        ? {
            startDate: plan.startDate,
            endDate: plan.endDate,
            unit,
            startWeightKg: Number(plan.startWeightKg ?? 0) || 0,
            targetLossKg: Number(plan.targetLossKg ?? 0) || 0,
          }
        : null,
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
