import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Card } from './components/ui';
import { ScenarioCanvas } from './components/ScenarioCanvas';
import { ThreatGauge } from './components/ThreatGauge';
import { TrustStrip } from './components/TrustStrip';
import { AttackLog } from './components/AttackLog';
import { cn } from './lib/utils';
import { formatPercent } from './lib/seed';
import { Clock3, Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';

export default function App() {
  const { state, dispatch } = useAnvilSimulation();

  return (
    <div className="app-shell min-h-full text-slate-100">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-r border-white/8 bg-[#0b0f13]/90 p-4 shadow-2xl backdrop-blur-xl xl:min-h-screen">
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-white/3 to-white/0 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.42em] text-amber-200/90">ANVIL</div>
                <div className="h-2.5 w-2.5 rounded-full bg-trust shadow-[0_0_0_6px_rgba(79,208,176,0.08)] animate-pulseSoft" />
              </div>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-white">Ground / Air</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The first demo is now focused on the Ground / Air command path only.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="micro-label">Demo scope</div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className={cn('rounded-xl border border-white/6 bg-black/20 px-3 py-2', 'text-white')}>
                  Environment: Ground / Air
                </div>
                <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2">No other environments or modes are exposed.</div>
                <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2">Single-line command authority validation.</div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="micro-label">Runtime status</div>
              <div className="space-y-2">
                <StatusLine label="Threat pressure" value={`${Math.round(state.threatPressure)}`} />
                <StatusLine label="Authority" value={state.trustState} />
                <StatusLine label="Mode" value={state.mode} />
                <StatusLine label="Elapsed" value={`${state.timeElapsed}s`} />
                <StatusLine label="Confidence" value={formatPercent(state.confidence)} />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="micro-label">Controls</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => dispatch({ type: state.isRunning ? 'pause' : 'run' })}>
                  {state.isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {state.isRunning ? 'Pause' : 'Run'}
                </Button>
                <Button variant="ghost" onClick={() => dispatch({ type: 'reset' })}>
                  <RotateCcw size={16} />
                  Reset
                </Button>
                <Button variant="danger" onClick={() => dispatch({ type: 'inject-attack' })}>
                  <ShieldAlert size={16} />
                  Inject Attack
                </Button>
              </div>
              <div className="text-xs leading-6 text-slate-500">Only the Ground / Air demo is wired up.</div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-20 border-b border-white/8 bg-[#0a0e12]/80 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="amber">{state.scenario.title}</Badge>
                  <Badge tone="muted">{state.scenario.doctrine}</Badge>
                  <Badge tone="success">Ground / Air</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {state.scenario.tags.map((tag) => (
                    <Badge key={tag} tone="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={state.confidence > 75 ? 'success' : state.confidence > 48 ? 'warn' : 'danger'}>
                  Confidence {Math.round(state.confidence)}%
                </Badge>
                <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : 'success'}>
                  {state.mode}
                </Badge>
                <Badge tone="muted">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={14} />
                    {state.timeElapsed}s
                  </span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-4 py-5 lg:px-6">
            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <ScenarioCanvas nodes={state.nodes} links={state.links} onSelectNode={() => undefined} />
              <div className="space-y-4">
                <ThreatGauge value={state.threatPressure} />
                <Card className="space-y-4">
                  <div>
                    <div className="micro-label">Ground / Air snapshot</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{state.headline}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{state.scenario.subtitle}</p>
                  </div>
                  <div className="grid gap-3">
                    {[
                      ['Verified command rate', state.metrics.verifiedCommandRate],
                      ['Rejected hostile attempts', state.metrics.rejectedHostileAttempts],
                      ['Integrity continuity', state.metrics.integrityContinuity],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{label as string}</span>
                          <span className="text-sm font-semibold text-white">{Math.round(Number(value))}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-trust" style={{ width: `${Math.max(8, Math.min(100, Number(value)))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <TrustStrip metrics={state.metrics} />

            <AttackLog events={state.attackEvents.slice(0, 12)} />

            <Card className="space-y-3">
              <div className="micro-label">What remains</div>
              <div className="text-sm leading-6 text-slate-300">
                The app now stays on one Ground / Air demo path instead of exposing the broader multi-screen test harness.
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/20 px-3 py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
