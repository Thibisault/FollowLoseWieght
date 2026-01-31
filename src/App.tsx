import React, { useEffect, useMemo, useState } from 'react'
import Chip from './components/Chip'
import Modal from './components/Modal'
import ProgressRing from './components/ProgressRing'
import Sparkline from './components/Sparkline'
import { clearState, loadState, saveState, type AppState, type Plan, type Unit } from './lib/storage'
import { derive, lastNDays, upsertEntry } from './lib/logic'
import { todayISO, formatFrShort } from './lib/time'
import { fmt1, fmt2, safeNumber } from './lib/math'

const LB_PER_KG = 2.2046226218

function classyInput(center = true) {
  return [
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
    'text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10',
    center ? 'text-center tabular-nums' : 'tabular-nums',
  ].join(' ')
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

type PlanDraftUI = {
  unit: Unit
  startWeight: string
  targetWeight: string
  durationDays: string
}

type EntryDraftUI = {
  date: string
  weight: string
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [openPlan, setOpenPlan] = useState(false)
  const [openEntry, setOpenEntry] = useState(false)

  useEffect(() => saveState(state), [state])

  const plan = state.plan
  const unit: Unit = plan?.unit ?? 'kg'
  const derived = useMemo(() => (plan ? derive(plan, state.entries) : null), [plan, state.entries])
  const recent = useMemo(() => lastNDays(state.entries, 14), [state.entries])

  const entriesDesc = useMemo(
    () => [...state.entries].sort((a, b) => b.date.localeCompare(a.date)),
    [state.entries],
  )

  const [planDraft, setPlanDraft] = useState<PlanDraftUI>({
    unit: 'kg',
    startWeight: '',
    targetWeight: '',
    durationDays: '30',
  })
  const [entryDraft, setEntryDraft] = useState<EntryDraftUI>({ date: todayISO(), weight: '' })

  useEffect(() => {
    if (!openPlan) return
    if (plan) {
      setPlanDraft({
        unit: plan.unit,
        startWeight: fmt1(toUnit(plan.startWeightKg, plan.unit)),
        targetWeight: fmt1(toUnit(plan.targetWeightKg, plan.unit)),
        durationDays: String(plan.durationDays),
      })
    } else {
      setPlanDraft({ unit: 'kg', startWeight: '', targetWeight: '', durationDays: '30' })
    }
  }, [openPlan, plan])

  useEffect(() => {
    if (!openEntry) return
    const t = todayISO()
    const latest = [...state.entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0]
    const baseKg = latest?.weightKg ?? (plan?.startWeightKg ?? 0)
    setEntryDraft({ date: t, weight: baseKg ? fmt1(toUnit(baseKg, unit)) : '' })
  }, [openEntry, state.entries, plan?.startWeightKg, unit])

  const headerGlow =
    'before:absolute before:inset-x-0 before:-top-20 before:h-48 before:rounded-full before:bg-gradient-to-r before:from-[#ff4fd8]/30 before:via-[#6d5cff]/25 before:to-[#ff4fd8]/30 before:blur-3xl'

  const card = 'rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-glow'
  const subtle = 'text-white/55 text-[12px] tracking-wide'

  const actionBtn =
    'w-full rounded-2xl bg-gradient-to-r from-[#ff4fd8] to-[#6d5cff] px-4 py-3 text-[15px] font-semibold text-black shadow-[0_16px_44px_rgba(109,92,255,0.25)] active:scale-[0.99] transition'

  const ghostBtn =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-semibold text-white/90 active:scale-[0.99] transition'

  const dangerBtn =
    'w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[15px] font-semibold text-red-100 active:scale-[0.99] transition'

  const current = derived && plan ? `${fmt1(toUnit(derived.currentWeightKg, unit))} ${unitLabel(unit)}` : '—'
  const start = plan ? `${fmt1(toUnit(plan.startWeightKg, unit))} ${unitLabel(unit)}` : '—'
  const target = derived && plan ? `${fmt1(toUnit(derived.targetWeightKg, unit))} ${unitLabel(unit)}` : '—'
  const remainingLoss = derived && plan ? `${fmt1(toUnit(derived.remainingLossKg, unit))} ${unitLabel(unit)}` : '—'
  const avg =
    derived && plan && derived.avgLossPerDayKg != null ? `${fmt2(toUnit(derived.avgLossPerDayKg, unit))} ${unitLabel(unit)}/j` : '—'

  return (
    <div className="min-h-dvh text-white safe-top safe-bottom">
      <div className={`relative mx-auto w-full max-w-[440px] px-4 pb-8 pt-6 ${headerGlow}`}>
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[20px] font-semibold tracking-tight">FollowLoseWieght</div>
              <div className="mt-1 text-[12px] text-white/50">Objectif • Durée • Suivi</div>
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
                  <div className={subtle}>Poids actuel</div>
                  <div className="mt-1 text-[22px] font-semibold tracking-tight tabular-nums">{current}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {plan && derived ? <Chip>{derived.daysRemaining} jours restants</Chip> : <Chip>Plan non défini</Chip>}
                  {plan ? <Chip tone="pink">{unitLabel(unit)}</Chip> : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px] text-white/45">
                <div>
                  Départ : <span className="text-white/70 tabular-nums">{start}</span>
                </div>
                <div>
                  À perdre : <span className="text-white/70 tabular-nums">{remainingLoss}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className={subtle}>Objectif</div>
                  <div className="mt-1 text-[16px] font-semibold tabular-nums break-words">{target}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className={subtle}>Moyenne / jour</div>
                  <div className="mt-1 text-[16px] font-semibold tabular-nums break-words">{avg}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[12px] text-white/45">
                  {plan && derived ? (
                    <>
                      Progression : <span className="text-white/70 tabular-nums">{Math.round(derived.progress * 100)}%</span>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                {plan && derived ? <ProgressRing value={derived.progress} /> : null}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setOpenEntry(true)}
                  className={actionBtn}
                  disabled={!plan}
                  style={!plan ? { opacity: 0.5 } : undefined}
                >
                  Entrer mon poids du jour
                </button>
              </div>
            </div>

            <div className={`${card} p-4 flex flex-col items-center justify-center`}>
              <div className="text-center">
                <div className={subtle}>Aujourd’hui</div>
                <div className="mt-1 text-[13px] text-white/70">{formatFrShort(todayISO())}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Sparkline entries={recent} />
          </div>

          {plan && entriesDesc.length ? (
            <div className={`${card} mt-4 p-5`}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold">Historique</div>
                <div className="text-[12px] text-white/50">{entriesDesc.length} entrée(s)</div>
              </div>

              <div className="mt-3 space-y-2 max-h-[320px] overflow-auto pr-1">
                {entriesDesc.map((e, idx) => {
                  const isTop = idx === 0
                  return (
                    <div
                      key={e.date}
                      className={
                        'flex items-center justify-between rounded-2xl border px-4 py-3 ' +
                        (isTop
                          ? 'border-white/15 bg-gradient-to-r from-white/10 to-white/5'
                          : 'border-white/10 bg-white/5')
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] text-white/85">{formatFrShort(e.date)}</div>
                        {isTop ? <span className="text-[11px] text-white/50">dernier</span> : null}
                      </div>
                      <div className="text-[13px] font-semibold tabular-nums">
                        {fmt1(toUnit(e.weightKg, unit))} {unitLabel(unit)}
                      </div>
                    </div>
                  )
                })}
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
                    const tw = safeNumber(planDraft.targetWeight)

                    let nextStart = planDraft.startWeight
                    let nextTarget = planDraft.targetWeight
                    if (sw != null) nextStart = fmt1(toUnit(fromUnit(sw, prev), u))
                    if (tw != null) nextTarget = fmt1(toUnit(fromUnit(tw, prev), u))

                    setPlanDraft({ ...planDraft, unit: u, startWeight: nextStart, targetWeight: nextTarget })
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

          <div>
            <div className="mb-2 text-[12px] text-white/60">Durée (jours)</div>
            <input
              inputMode="numeric"
              placeholder="ex. 30"
              value={planDraft.durationDays}
              onChange={(e) => setPlanDraft({ ...planDraft, durationDays: e.target.value })}
              className={classyInput(true)}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] text-white/60">Poids de départ ({unitLabel(planDraft.unit)})</div>
            <input
              inputMode="decimal"
              placeholder="ex. 71,6"
              value={planDraft.startWeight}
              onChange={(e) => setPlanDraft({ ...planDraft, startWeight: e.target.value })}
              className={classyInput(true)}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] text-white/60">Poids objectif ({unitLabel(planDraft.unit)})</div>
            <input
              inputMode="decimal"
              placeholder="ex. 68"
              value={planDraft.targetWeight}
              onChange={(e) => setPlanDraft({ ...planDraft, targetWeight: e.target.value })}
              className={classyInput(true)}
            />
          </div>

          <div className="pt-2">
            <button
              className={actionBtn}
              onClick={() => {
                const start = todayISO()
                const duration = Math.max(1, Math.round(Number(planDraft.durationDays || 0) || 0))
                const sw = safeNumber(planDraft.startWeight) ?? 0
                const tw = safeNumber(planDraft.targetWeight) ?? 0

                const nextPlan: Plan = {
                  startDate: start,
                  durationDays: duration,
                  unit: planDraft.unit,
                  startWeightKg: Math.max(0, fromUnit(sw, planDraft.unit)),
                  targetWeightKg: Math.max(0, fromUnit(tw, planDraft.unit)),
                }

                setState((s) => ({ ...s, plan: nextPlan }))
                setOpenPlan(false)
              }}
            >
              Enregistrer
            </button>
          </div>

          <div className="pt-1">
            <button className={ghostBtn} onClick={() => setPlanDraft({ unit: 'kg', startWeight: '', targetWeight: '', durationDays: '30' })}>
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

      <Modal open={openEntry} title={`Poids du jour (${unitLabel(unit)})`} onClose={() => setOpenEntry(false)}>
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-[12px] text-white/60">Date</div>
            <input
              type="date"
              value={entryDraft.date}
              onChange={(e) => setEntryDraft({ ...entryDraft, date: e.target.value })}
              className={classyInput(true)}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] text-white/60">Poids</div>
            <input
              inputMode="decimal"
              placeholder="ex. 71,6"
              value={entryDraft.weight}
              onChange={(e) => setEntryDraft({ ...entryDraft, weight: e.target.value })}
              className={classyInput(true)}
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
        </div>
      </Modal>
    </div>
  )
}
