import type { Entry, Plan } from './storage'
import { clamp } from './math'
import { diffDays, todayISO } from './time'

export type Derived = {
  daysRemaining: number
  currentWeightKg: number
  targetWeightKg: number
  remainingLossKg: number
  avgLossPerDayKg: number | null
  progress: number
}

export function derive(plan: Plan, entries: Entry[]): Derived {
  const today = todayISO()
  const elapsedRaw = diffDays(plan.startDate, today)
  const elapsed = clamp(elapsedRaw, 0, plan.durationDays)
  const daysRemaining = Math.max(0, plan.durationDays - elapsed)

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted.length ? sorted[sorted.length - 1] : null

  const currentWeightKg = latest?.weightKg ?? plan.startWeightKg
  const targetWeightKg = plan.targetWeightKg
  const remainingLossKg = Math.max(0, currentWeightKg - targetWeightKg)

  const avgLossPerDayKg = daysRemaining > 0 ? (remainingLossKg / daysRemaining) : null

  const totalToLose = Math.max(0, plan.startWeightKg - targetWeightKg)
  const done = totalToLose > 0 ? (plan.startWeightKg - currentWeightKg) / totalToLose : 0
  const progress = Math.max(0, Math.min(1, done))

  return { daysRemaining, currentWeightKg, targetWeightKg, remainingLossKg, avgLossPerDayKg, progress }
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
