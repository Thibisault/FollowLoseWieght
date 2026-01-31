import React, { useEffect, useMemo, useState } from 'react'
import Chip from './components/Chip'
import Modal from './components/Modal'
import ProgressRing from './components/ProgressRing'
import Sparkline from './components/Sparkline'
import { clearState, loadState, saveState, type AppState, type Plan, type Unit } from './lib/storage'
import { derive, lastNDays, upsertEntry } from './lib/logic'
import { formatFr, todayISO, parseISODate, toISODate } from './lib/time'
import { fmt1, fmt2, safeNumber } from './lib/math'

const LB_PER_KG = 2.2046226218

function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

function classyInput() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10'
}

function toUnit(kg: number, unit: Unit): number {
  return unit === 'lb' ? kg * LB_PER_KG : kg
}

function fromUnit(value: number, unit: Unit): number {
  return unit === 'lb' ? value / LB_PER_KG : value
}

function unitLabel(unit: Unit) {
  return unit === 'lb' ? 'lb' : 'kg'
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

type PlanDraftUI = {
  startDate: string
  endDate: string
  unit: Unit
  startWeight: string
  targetLoss: string
}

type EntryDraftUI = {
  date: string
  weight: string
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [openPlan, setOpenPlan] = useState(false)
  const [openEntry, setOpenEntry] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const plan = state.plan
  const unit: Unit = plan?.unit ?? 'kg'
  const derived = useMemo(() => (plan ? derive(plan, state.entries) : null), [plan, state.entries])
  const recent = useMemo(() => lastNDays(state.entries, 14), [state.entries])

  const [planDraft, setPlanDraft] = useState<PlanDraftUI>(() => {
    const t = todayISO()
    return { startDate: t, endDate: addDaysISO(t, 30), unit: 'kg', startWeight: '', targetLoss: '' }
  })

  const [entryDraft, setEntryDraft] = useState<EntryDraftUI>(() => ({ date: todayISO(), weight: '' }))

  useEffect(() => {
    if (!openPlan) return
    const t = todayISO()
    if (plan) {
      setPlanDraft({
        startDate: plan.startDate,
        endDate: plan.endDate,
        unit: plan.unit,
        startWeight: plan.startWeightKg ? fmt1(toUnit(plan.startWeightKg, plan.unit)) : '',
        targetLoss: plan.targetLossKg ? fmt1(toUnit(plan.targetLossKg, plan.unit)) : '',
      })
    } else {
      setPlanDraft({ startDate: t, endDate: addDaysISO(t, 30), unit: 'kg', startWeight: '', targetLoss: '' })
    }
  }, [openPlan, plan])

  useEffect(() => {
    if (!openEntry) return
    const t = todayISO()
    const latest = [...state.entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0]
    const baseKg = latest?.weightKg ?? (plan?.startWeightKg ?? 0)
    setEntryDraft({ date: t, weight: baseKg ? fmt1(toUnit(baseKg, unit)) : '' })
  }, [openEntry, state.entries, plan?.startWeightKg, unit])

  const subtle = 'text-white/55 text-[12px] tracking-wide'
  const card = 'rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-glow'

  const actionBtn =
    'w-full rounded-2xl bg-gradient-to-r from-[#ff4fd8] to-[#6d5cff] px-4 py-3 text-[15px] font-semibold text-black shadow-[0_16px_44px_rgba(109,92,255,0.25)] active:scale-[0.99] transition'

  const ghostBtn =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-semibold text-white/90 active:scale-[0.99] transition'

  const dangerBtn =
    'w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[15px] font-semibold text-red-100 active:scale-[0.99] transition'

  const headerGlow =
    'before:absolute before:inset-x-0 before:-top-20 before:h-48 before:rounded-full before:bg-gradient-to-r before:from-[#ff4fd8]/30 before:via-[#6d5cff]/25 before:to-[#ff4fd8]/30 before:blur-3xl'

  const endWeightKg = derived?.endWeightKg ?? null
  const currentWeightKg = derived?.currentWeightKg ?? null

  const progress = useMemo(() => {
    if (!plan || !derived) return 0
    const total = plan.targetLossKg
    if (total <= 0) return 0
    const current = derived.currentWeightKg ?? plan.startWeightKg
    return clamp01((plan.startWeightKg - current) / total)
  }, [plan, derived])

  const dailyPlanned = derived && plan ? toUnit(derived.plannedDailyLossKg, unit) : null
  const dailyRequired = derived?.requiredDailyLossKg != null ? toUnit(derived.requiredDailyLossKg, unit) : null

  const displayedCurrent = currentWeightKg != null ? `${fmt1(toUnit(currentWeightKg, unit))} ${unitLabel(unit)}` : '—'
  const displayedTargetWeight = endWeightKg != null && plan ? `${fmt1(toUnit(endWeightKg, unit))} ${unitLabel(unit)}` : '—'
  const displayedGoalLoss = plan ? `-${fmt1(toUnit(plan.targetLossKg, unit))} ${unitLabel(unit)}` : '—'

  return (
    <div className="min-h-dvh text-white safe-top safe-bottom">
      <div className={`relative mx-auto w-full max-w-[440px] px-4 pb-8 pt-6 ${headerGlow}`}>
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[20px] font-semibold tracking-tight">FollowLoseWieght</div>
              <div className="mt-1 text-[12px] text-white/50">Suivi épuré, installable.</div>
            </div>

            <button
              onClick={() => setOpenPlan(true)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/85"
            >
              {plan ? 'Plan' : 'Configurer'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-[1fr,auto] gap-4">
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className={subtle}>Poids du jour</div>
                  <div className="mt-1 text-[22px] font-semibold tracking-tight">{displayedCurrent}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {plan ? (
                    <Chip>{derived?.daysRemaining ?? 0} jours restants</Chip>
                  ) : (
                    <Chip>Plan non défini</Chip>
                  )}
                  {plan ? <Chip tone="pink">{unitLabel(unit)}</Chip> : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={subtle}>Objectif</div>
                  <div className="mt-1 text-[15px] font-semibold">{displayedGoalLoss}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={subtle}>Cible</div>
                  <div className="mt-1 text-[15px] font-semibold">{displayedTargetWeight}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={subtle}>Moyenne</div>
                  <div className="mt-1 text-[15px] font-semibold">
                    {plan && dailyPlanned != null ? `${fmt2(dailyPlanned)} ${unitLabel(unit)}/j` : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setOpenEntry(true)}
                  className={actionBtn}
                  disabled={!plan}
                  style={!plan ? { opacity: 0.5 } : undefined}
                >
                  Entrer mon poids
                </button>
              </div>

              {plan && derived && dailyRequired != null ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone={derived.isAggressive ? 'warn' : 'slate'}>
                    {derived.isAggressive ? 'Rythme trop élevé' : 'Rythme requis'}
                    <span className="text-white/85">
                      {derived.daysRemaining === 0 ? '—' : `${fmt2(dailyRequired)} ${unitLabel(unit)}/j`}
                    </span>
                  </Chip>
                </div>
              ) : null}
            </div>

            <div className={`${card} p-4 flex flex-col items-center justify-center`}>
              <ProgressRing value={progress} label="Progression" sub={plan ? displayedGoalLoss : undefined} />
            </div>
          </div>

          <div className="mt-4">
            <Sparkline entries={recent} />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[12px] text-white/45">14 derniers enregistrements</div>
              <div className="text-[12px] text-white/55">{state.entries.length ? `${state.entries.length} entrée(s)` : '—'}</div>
            </div>
          </div>

          {plan && state.entries.length ? (
            <div className={`${card} mt-4 p-5`}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold">Historique</div>
                <div className="text-[12px] text-white/50">récent</div>
              </div>

              <div className="mt-3 space-y-2">
                {[...state.entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((e) => (
                  <div
                    key={e.date}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="text-[13px] text-white/85">{formatFr(e.date)}</div>
                    <div className="text-[13px] font-semibold">
                      {fmt1(toUnit(e.weightKg, unit))} {unitLabel(unit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 text-center text-[11px] text-white/30">Offline • Installable</div>
        </div>
      </div>

      <Modal open={openPlan} title={plan ? 'Plan' : 'Configurer'} onClose={() => setOpenPlan(false)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-white/60">Unité</div>
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {(['kg', 'lb'] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    if (planDraft.unit === u) return
                    const prev = planDraft.unit
                    const sw = safeNumber(planDraft.startWeight)
                    const tl = safeNumber(planDraft.targetLoss)
                    let nextStart = planDraft.startWeight
                    let nextLoss = planDraft.targetLoss
                    if (sw != null) nextStart = fmt1(toUnit(fromUnit(sw, prev), u))
                    if (tl != null) nextLoss = fmt1(toUnit(fromUnit(tl, prev), u))
                    setPlanDraft({ ...planDraft, unit: u, startWeight: nextStart, targetLoss: nextLoss })
                  }}
                  className={
                    `px-4 py-2 text-[13px] rounded-2xl transition ` +
                    (planDraft.unit === u ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/85')
                  }
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 text-[12px] text-white/60">Début</div>
              <input
                type="date"
                value={planDraft.startDate}
                onChange={(e) => setPlanDraft({ ...planDraft, startDate: e.target.value })}
                className={classyInput()}
              />
            </div>
            <div>
              <div className="mb-2 text-[12px] text-white/60">Fin</div>
              <input
                type="date"
                value={planDraft.endDate}
                onChange={(e) => setPlanDraft({ ...planDraft, endDate: e.target.value })}
                className={classyInput()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 text-[12px] text-white/60">Départ ({unitLabel(planDraft.unit)})</div>
              <input
                inputMode="decimal"
                placeholder="ex. 71,6"
                value={planDraft.startWeight}
                onChange={(e) => setPlanDraft({ ...planDraft, startWeight: e.target.value })}
                className={classyInput()}
              />
            </div>
            <div>
              <div className="mb-2 text-[12px] text-white/60">Perte ({unitLabel(planDraft.unit)})</div>
              <input
                inputMode="decimal"
                placeholder="ex. 6,5"
                value={planDraft.targetLoss}
                onChange={(e) => setPlanDraft({ ...planDraft, targetLoss: e.target.value })}
                className={classyInput()}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              className={actionBtn}
              onClick={() => {
                const start = planDraft.startDate || todayISO()
                const end = planDraft.endDate || addDaysISO(start, 30)
                const sw = safeNumber(planDraft.startWeight) ?? 0
                const tl = safeNumber(planDraft.targetLoss) ?? 0

                const nextPlan: Plan = {
                  startDate: start,
                  endDate: end,
                  unit: planDraft.unit,
                  startWeightKg: Math.max(0, fromUnit(sw, planDraft.unit)),
                  targetLossKg: Math.max(0, fromUnit(tl, planDraft.unit)),
                }

                setState((s) => ({ ...s, plan: nextPlan }))
                setOpenPlan(false)
              }}
            >
              Enregistrer
            </button>
          </div>

          <div className="pt-1">
            <button
              className={ghostBtn}
              onClick={() => {
                const t = todayISO()
                setPlanDraft({ startDate: t, endDate: addDaysISO(t, 30), unit: 'kg', startWeight: '', targetLoss: '' })
              }}
            >
              Réinitialiser le formulaire
            </button>
          </div>

          <div className="pt-1">
            <button
              className={dangerBtn}
              onClick={() => {
                clearState()
                setState({ plan: null, entries: [] })
                setOpenPlan(false)
              }}
            >
              Réinitialiser tout
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={openEntry} title={`Poids (${unitLabel(unit)})`} onClose={() => setOpenEntry(false)}>
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-[12px] text-white/60">Date</div>
            <input
              type="date"
              value={entryDraft.date}
              onChange={(e) => setEntryDraft({ ...entryDraft, date: e.target.value })}
              className={classyInput()}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] text-white/60">Poids</div>
            <input
              inputMode="decimal"
              placeholder="ex. 71,6"
              value={entryDraft.weight}
              onChange={(e) => setEntryDraft({ ...entryDraft, weight: e.target.value })}
              className={classyInput()}
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              className={actionBtn}
              onClick={() => {
                if (!plan) return
                const date = entryDraft.date || todayISO()
                const v = safeNumber(entryDraft.weight) ?? 0
                const kg = Math.max(0, fromUnit(v, unit))
                const next = upsertEntry(state.entries, { date, weightKg: kg })
                setState((s) => ({ ...s, entries: next }))
                setOpenEntry(false)
              }}
              disabled={!plan}
              style={!plan ? { opacity: 0.5 } : undefined}
            >
              Valider
            </button>
          </div>

          {plan && derived?.requiredDailyLossKg != null ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[12px] text-white/55">Rythme requis</div>
              <div className="mt-1 text-[18px] font-semibold tracking-tight">
                {fmt2(toUnit(derived.requiredDailyLossKg, unit))} {unitLabel(unit)} / jour
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
