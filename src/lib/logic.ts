import type { Entry, Plan } from './storage'
import { daysBetweenInclusive, daysUntil, todayISO, parseISODate } from './time'
import { clamp } from './math'

export type Derived = {
  endWeightKg: number
  totalDays: number
  daysElapsed: number
  daysRemaining: number
  expectedWeightTodayKg: number
  currentWeightKg: number | null
  remainingLossKg: number | null
  requiredDailyLossKg: number | null
  isAggressive: boolean
}

export function derive(plan: Plan, entries: Entry[]): Derived {
  const today = todayISO()
  const endWeightKg = plan.startWeightKg - plan.targetLossKg

  const totalDays = daysBetweenInclusive(plan.startDate, plan.endDate)

  const start = parseISODate(plan.startDate).getTime()
  const now = parseISODate(today).getTime()
  const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  const daysElapsed = clamp(elapsed, 0, totalDays - 1)

  const daysRemaining = daysUntil(plan.endDate, today)

  const dailyPlannedLoss = plan.targetLossKg / totalDays
  const expectedWeightTodayKg = plan.startWeightKg - dailyPlannedLoss * daysElapsed

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted.length ? sorted[sorted.length - 1] : null
  const currentWeightKg = latest?.weightKg ?? null

  const remainingLossKg = currentWeightKg == null ? null : Math.max(0, currentWeightKg - endWeightKg)
  const requiredDailyLossKg = (remainingLossKg == null || daysRemaining === 0) ? null : remainingLossKg / daysRemaining

  // Simple guardrail: losing > 1% of current weight per week is flagged as "aggressive"
  const weeklyLoss = (requiredDailyLossKg ?? 0) * 7
  const weeklyPct = currentWeightKg ? (weeklyLoss / currentWeightKg) * 100 : 0
  const isAggressive = weeklyPct > 1.0

  return {
    endWeightKg,
    totalDays,
    daysElapsed,
    daysRemaining,
    expectedWeightTodayKg,
    currentWeightKg,
    remainingLossKg,
    requiredDailyLossKg,
    isAggressive,
  }
}

export function upsertEntry(entries: Entry[], entry: Entry): Entry[] {
  const next = entries.filter(e => e.date !== entry.date).concat(entry)
  next.sort((a, b) => a.date.localeCompare(b.date))
  return next
}

export function lastNDays(entries: Entry[], n: number): Entry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.slice(Math.max(0, sorted.length - n))
}
