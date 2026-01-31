import React, { useEffect, useMemo, useState } from 'react'
import Chip from './components/Chip'
import Modal from './components/Modal'
import ProgressRing from './components/ProgressRing'
import Sparkline from './components/Sparkline'
import { clearState, loadState, saveState, type AppState, type Entry, type Plan } from './lib/storage'
import { derive, lastNDays, upsertEntry } from './lib/logic'
import { formatFr, todayISO, parseISODate, toISODate } from './lib/time'
import { round1, round2, safeNumber } from './lib/math'

function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

function classyInput() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10'
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [openPlan, setOpenPlan] = useState(false)
  const [openEntry, setOpenEntry] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const plan = state.plan
  const derived = useMemo(() => (plan ? derive(plan, state.entries) : null), [plan, state.entries])
  const recent = useMemo(() => lastNDays(state.entries, 14), [state.entries])

  const headerGlow =
    'before:absolute before:inset-x-0 before:-top-20 before:h-48 before:rounded-full before:bg-gradient-to-r before:from-[#ff4fd8]/30 before:via-[#6d5cff]/25 before:to-[#ff4fd8]/30 before:blur-3xl'

  const [planDraft, setPlanDraft] = useState<Plan>(() => {
    const t = todayISO()
    return {
      startDate: t,
      endDate: addDaysISO(t, 30),
      startWeightKg: 0,
      targetLossKg: 0,
    }
  })

  const [entryDraft, setEntryDraft] = useState<Entry>(() => ({ date: todayISO(), weightKg: 0 }))

  useEffect(() => {
    if (!openPlan) return
    if (plan) setPlanDraft(plan)
    else {
      const t = todayISO()
      setPlanDraft({ startDate: t, endDate: addDaysISO(t, 30), startWeightKg: 0, targetLossKg: 0 })
    }
  }, [openPlan, plan])

  useEffect(() => {
    if (!openEntry) return
    const t = todayISO()
    const latest = [...state.entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0]
    setEntryDraft({ date: t, weightKg: latest?.weightKg ?? (plan?.startWeightKg ?? 0) })
  }, [openEntry, state.entries, plan?.startWeightKg])

  const endWeight = derived ? derived.endWeightKg : null
  const progress = useMemo(() => {
    if (!plan || !derived) return 0
    const total = plan.targetLossKg
    if (total <= 0) return 0
    const current = derived.currentWeightKg ?? plan.startWeightKg
    const done = clamp01((plan.startWeightKg - current) / total)
    return done
  }, [plan, derived])

  function clamp01(n: number) {
    return Math.max(0, Math.min(1, n))
  }

  const subtle =
    'text-white/55 text-[12px] tracking-wide'
  const card =
    'rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-glow'

  const actionBtn =
    'w-full rounded-2xl bg-gradient-to-r from-[#ff4fd8] to-[#6d5cff] px-4 py-3 text-[15px] font-semibold text-black shadow-[0_16px_44px_rgba(109,92,255,0.25)] active:scale-[0.99] transition'

  const ghostBtn =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-semibold text-white/90 active:scale-[0.99] transition'

  const dangerBtn =
    'w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[15px] font-semibold text-red-100 active:scale-[0.99] transition'

  return (
    <div className="min-h-dvh text-white safe-top safe-bottom">
      <div className={`relative mx-auto w-full max-w-[440px] px-4 pb-8 pt-6 ${headerGlow}`}>
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[20px] font-semibold tracking-tight">FollowLoseWieght</div>
              <div className="mt-1 text-[12px] text-white/50">Suivi simple. Objectif clair.</div>
            </div>

            <button
              onClick={() => setOpenPlan(true)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/85"
            >
              {plan ? 'Modifier' : 'Configurer'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-[1fr,auto] gap-4">
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className={subtle}>Aujourd’hui</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight">
                    {derived?.currentWeightKg != null ? `${round1(derived.currentWeightKg)} kg` : '—'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {plan ? (
                    <Chip tone="pink">
                      Fin {formatFr(plan.endDate)}
                    </Chip>
                  ) : (
                    <Chip>Plan non défini</Chip>
                  )}
                  {derived?.daysRemaining != null && plan ? (
                    <Chip>{derived.daysRemaining} jours restants</Chip>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={subtle}>Objectif</div>
                  <div className="mt-1 text-[16px] font-semibold">
                    {plan ? `-${round1(plan.targetLossKg)} kg` : '—'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={subtle}>Poids cible</div>
                  <div className="mt-1 text-[16px] font-semibold">
                    {endWeight != null && plan ? `${round1(endWeight)} kg` : '—'}
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
                  Entrer mon poids du jour
                </button>
              </div>

              {plan && derived ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {derived.requiredDailyLossKg != null ? (
                    <Chip tone={derived.isAggressive ? 'warn' : 'slate'}>
                      {derived.isAggressive ? 'Objectif trop élevé' : 'Rythme actuel'}
                      <span className="text-white/85">
                        {derived.daysRemaining === 0 ? '—' : `${round2(derived.requiredDailyLossKg)} kg/j`}
                      </span>
                    </Chip>
                  ) : null}

                  <Chip>
                    Attendu aujourd’hui <span className="text-white/85">{round1(derived.expectedWeightTodayKg)} kg</span>
                  </Chip>
                </div>
              ) : null}
            </div>

            <div className={`${card} p-4 flex flex-col items-center justify-center`}>
              <ProgressRing
                value={progress}
                label="Progression"
                sub={plan ? `-${round1(plan.targetLossKg)} kg` : undefined}
              />
            </div>
          </div>

          <div className="mt-4">
            <Sparkline entries={recent} />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[12px] text-white/45">14 derniers enregistrements</div>
              {state.entries.length ? (
                <div className="text-[12px] text-white/55">
                  Dernier: {formatFr([...state.entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].date)}
                </div>
              ) : (
                <div className="text-[12px] text-white/55">Aucun poids saisi</div>
              )}
            </div>
          </div>

          {plan && state.entries.length ? (
            <div className={`${card} mt-4 p-5`}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold">Historique</div>
                <div className="text-[12px] text-white/50">{state.entries.length} entrée(s)</div>
              </div>

              <div className="mt-3 space-y-2">
                {[...state.entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((e) => (
                  <div key={e.date} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-[13px] text-white/85">{formatFr(e.date)}</div>
                    <div className="text-[13px] font-semibold">{round1(e.weightKg)} kg</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 text-center text-[11px] text-white/30">
            Offline • Installable • Données locales
          </div>
        </div>
      </div>

      <Modal open={openPlan} title={plan ? 'Modifier le plan' : 'Configurer le plan'} onClose={() => setOpenPlan(false)}>
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-[12px] text-white/60">Date de début</div>
            <input
              type="date"
              value={planDraft.startDate}
              onChange={(e) => setPlanDraft({ ...planDraft, startDate: e.target.value })}
              className={classyInput()}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] text-white/60">Date de fin</div>
            <input
              type="date"
              value={planDraft.endDate}
              onChange={(e) => setPlanDraft({ ...planDraft, endDate: e.target.value })}
              className={classyInput()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 text-[12px] text-white/60">Poids de départ (kg)</div>
              <input
                inputMode="decimal"
                placeholder="ex. 106,9"
                value={String(planDraft.startWeightKg || '')}
                onChange={(e) => {
                  const n = safeNumber(e.target.value)
                  setPlanDraft({ ...planDraft, startWeightKg: n ?? 0 })
                }}
                className={classyInput()}
              />
            </div>
            <div>
              <div className="mb-2 text-[12px] text-white/60">Perte visée (kg)</div>
              <input
                inputMode="decimal"
                placeholder="ex. 6"
                value={String(planDraft.targetLossKg || '')}
                onChange={(e) => {
                  const n = safeNumber(e.target.value)
                  setPlanDraft({ ...planDraft, targetLossKg: n ?? 0 })
                }}
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
                const startW = Number.isFinite(planDraft.startWeightKg) ? planDraft.startWeightKg : 0
                const loss = Number.isFinite(planDraft.targetLossKg) ? planDraft.targetLossKg : 0

                const nextPlan: Plan = {
                  startDate: start,
                  endDate: end,
                  startWeightKg: Math.max(0, startW),
                  targetLossKg: Math.max(0, loss),
                }

                setState((s) => ({
                  ...s,
                  plan: nextPlan,
                  entries: s.entries.length ? s.entries : [],
                }))
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
                setPlanDraft({ startDate: t, endDate: addDaysISO(t, 30), startWeightKg: 0, targetLossKg: 0 })
              }}
            >
              Revenir au modèle
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

      <Modal open={openEntry} title="Poids du jour" onClose={() => setOpenEntry(false)}>
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
            <div className="mb-2 text-[12px] text-white/60">Poids (kg)</div>
            <input
              inputMode="decimal"
              placeholder="ex. 106,2"
              value={String(entryDraft.weightKg || '')}
              onChange={(e) => {
                const n = safeNumber(e.target.value)
                setEntryDraft({ ...entryDraft, weightKg: n ?? 0 })
              }}
              className={classyInput()}
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              className={actionBtn}
              onClick={() => {
                const date = entryDraft.date || todayISO()
                const weight = Math.max(0, entryDraft.weightKg)
                const next = upsertEntry(state.entries, { date, weightKg: weight })
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
              <div className="text-[12px] text-white/55">À partir d’aujourd’hui</div>
              <div className="mt-1 text-[18px] font-semibold tracking-tight">
                {round2(derived.requiredDailyLossKg)} kg / jour
              </div>
              <div className="mt-1 text-[12px] text-white/45">
                Jusqu’au {formatFr(plan.endDate)}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
