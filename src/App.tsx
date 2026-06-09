import {
  Activity,
  Clock3,
  Lock,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Card } from './components/ui';
import { ScenarioCanvas } from './components/ScenarioCanvas';
import { ThreatGauge } from './components/ThreatGauge';
import { TrustStrip } from './components/TrustStrip';
import { AttackLog } from './components/AttackLog';
import { MetricCard } from './components/MetricCard';
import { cn } from './lib/utils';
import { formatPercent, formatSeconds } from './lib/seed';

export default function App() {
  const { state, dispatch } = useAnvilSimulation();

  const metricCards = [
    {
      label: 'Threat pressure',
      value: `${Math.round(state.threatPressure)}`,
      subvalue: 'Current pressure index',
      tone: 'hostile' as const,
      progress: state.threatPressure,
    },
    {
      label: 'Confidence',
      value: formatPercent(state.confidence),
      subvalue: state.trustState.replace('-', ' '),
      tone: 'trust' as const,
      progress: state.confidence,
    },
    {
      label: 'Verified command rate',
      value: formatPercent(state.metrics.verifiedCommandRate),
      subvalue: 'Accepted authority path',
      tone: 'trust' as const,
      progress: state.metrics.verifiedCommandRate,
    },
    {
      label: 'Rejected hostile attempts',
      value: `${Math.round(state.metrics.rejectedHostileAttempts)}`,
      subvalue: 'Suppressed inputs',
      tone: 'amber' as const,
      progress: state.metrics.rejectedHostileAttempts,
    },
    {
      label: 'Integrity continuity',
      value: formatPercent(state.metrics.integrityContinuity),
      subvalue: state.metrics.guardrailLock,
      tone: 'trust' as const,
      progress: state.metrics.integrityContinuity,
    },
    {
      label: 'Elapsed / mode',
      value: formatSeconds(state.timeElapsed),
      subvalue: state.mode,
      tone: 'amber' as const,
      progress: Math.min(100, (state.timeElapsed % 300) / 3),
    },
  ];

  return (
    <div className="app-shell min-h-screen bg-[#0b0b0b] text-[#d6d6d6]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col border-r border-white/[0.07] bg-[#090909]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center border border-white/[0.12] bg-[#101010]">
                <div className="h-3 w-3 border border-white/70" />
              </div>
              <div>
                <div className="text-[13px] font-semibold tracking-normal text-[#f3f3f3]">ANVIL</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#626262]">Console</div>
              </div>
            </div>
            <Menu size={16} className="text-[#7a7a7a]" />
          </div>

          <div className="thin-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div>
              <div className="micro-label mb-2">General</div>
              <div className="border border-white/[0.07] bg-[#151515] px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[#f3f3f3]">
                  <div className="h-2 w-2 bg-[#5e5e5e]" />
                  Ground / Air Overview
                </div>
              </div>
            </div>

            <SidebarGroup title="Demo scope">
              <SidebarLine label="Environment" value="Ground / Air" />
              <SidebarLine label="Constraint" value="Single-line command authority validation" />
              <SidebarLine label="Coverage" value="Other environments hidden" />
            </SidebarGroup>

            <SidebarGroup title="Runtime">
              <SidebarLine label="Threat pressure" value={`${Math.round(state.threatPressure)}`} tone={toneForThreat(state.threatPressure)} />
              <SidebarLine label="Authority" value={state.trustState} tone={toneForTrust(state.trustState)} />
              <SidebarLine label="Mode" value={state.mode} tone={toneForMode(state.mode)} />
              <SidebarLine label="Elapsed" value={formatSeconds(state.timeElapsed)} />
              <SidebarLine label="Confidence" value={formatPercent(state.confidence)} tone={toneForConfidence(state.confidence)} />
            </SidebarGroup>

            <SidebarGroup title="Controls">
              <div className="grid gap-2">
                <Button
                  variant="default"
                  onClick={() => dispatch({ type: state.isRunning ? 'pause' : 'run' })}
                  className="w-full justify-start"
                >
                  {state.isRunning ? <Pause size={15} /> : <Play size={15} />}
                  {state.isRunning ? 'Pause' : 'Run'}
                </Button>
                <Button variant="outline" onClick={() => dispatch({ type: 'reset' })} className="w-full justify-start">
                  <RotateCcw size={15} />
                  Reset
                </Button>
                <Button variant="danger" onClick={() => dispatch({ type: 'inject-attack' })} className="w-full justify-start">
                  <ShieldAlert size={15} />
                  Inject Attack
                </Button>
              </div>
            </SidebarGroup>
          </div>

          <div className="border-t border-white/[0.07] px-4 py-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#626262]">
              <span>Runtime</span>
              <span>Ground / Air</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#8c8c8c]">
              <Lock size={12} />
              Ground / Air only demo
            </div>
          </div>
        </aside>

        <main className="min-w-0 bg-[#101010]">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#111111]">
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 min-w-0 flex-1 items-center gap-3 border border-white/[0.07] bg-[#0f0f0f] px-3 text-[12px] text-[#6f6f6f]">
                  <Search size={15} className="shrink-0 text-[#7d7d7d]" />
                  <span className="truncate">SEARCH...</span>
                  <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[#545454]">⌘K</span>
                </div>
                <div className="hidden items-center gap-2 xl:flex">
                  <Badge tone={state.confidence > 74 ? 'success' : state.confidence > 48 ? 'warn' : 'danger'}>
                    Confidence {Math.round(state.confidence)}%
                  </Badge>
                  <Badge tone={state.mode === 'Recovery' ? 'amber' : state.mode === 'Simulated' ? 'success' : 'danger'}>{state.mode}</Badge>
                  <Badge tone="muted" className="inline-flex items-center gap-2">
                    <Clock3 size={12} />
                    {formatSeconds(state.timeElapsed)}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {state.scenario.tags.map((tag, index) => (
                  <div
                    key={tag}
                    className={cn(
                      'border px-3 py-2 text-[11px] uppercase tracking-[0.12em]',
                      index === 0 ? 'border-white/[0.08] bg-[#1a1a1a] text-[#f3f3f3]' : 'border-white/[0.06] bg-[#101010] text-[#8c8c8c]',
                    )}
                  >
                    {tag}
                  </div>
                ))}
                <div className="ml-auto text-[11px] text-[#8c8c8c]">{state.scenario.doctrine}</div>
              </div>
            </div>
          </header>

          <div className="space-y-4 p-4">
            <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-3">
              <div>
                <div className="micro-label">Scenario</div>
                <div className="text-[14px] font-medium text-[#f3f3f3]">{state.scenario.title}</div>
              </div>
              <div className="text-right text-[11px] text-[#8c8c8c]">{state.scenario.subtitle}</div>
            </div>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metricCards.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    subvalue={metric.subvalue}
                    tone={metric.tone}
                    progress={metric.progress}
                  />
                ))}
              </div>

              <Card className="space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="micro-label">Threat panel</div>
                    <div className="text-[13px] font-medium text-[#f3f3f3]">Pressure and recovery trend</div>
                  </div>
                  <Badge tone={state.threatPressure > 60 ? 'danger' : state.threatPressure > 32 ? 'warn' : 'success'}>
                    {state.threatPressure > 60 ? 'High' : state.threatPressure > 32 ? 'Moderate' : 'Low'}
                  </Badge>
                </div>
                <ThreatGauge value={state.threatPressure} />
                <div className="border border-white/[0.06] bg-[#121212] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="micro-label">Series view</div>
                    <div className="inline-flex items-center gap-2 text-[11px] text-[#8c8c8c]">
                      <Activity size={12} />
                      Live trend
                    </div>
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={state.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="tick" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: '#111111',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 4,
                            color: '#f3f3f3',
                            boxShadow: 'none',
                          }}
                          labelStyle={{ color: '#8c8c8c' }}
                        />
                        <Line type="monotone" dataKey="jamming" stroke="#d95c59" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="spoof" stroke="#d7a84b" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="recovery" stroke="#36b37e" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </section>

            <ScenarioCanvas nodes={state.nodes} links={state.links} onSelectNode={() => undefined} />

            <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <TrustStrip metrics={state.metrics} />
              <AttackLog events={state.attackEvents.slice(0, 12)} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="micro-label">{title}</div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SidebarLine({
  label,
  value,
  tone = 'muted',
}: {
  label: string;
  value: string;
  tone?: SidebarTone;
}) {
  const toneClass =
    tone === 'success'
      ? 'text-[#72c8a0]'
      : tone === 'warn'
        ? 'text-[#e0b466]'
        : tone === 'danger'
          ? 'text-[#e28a86]'
          : 'text-[#d6d6d6]';

  return (
    <div className="flex items-center justify-between gap-3 border border-white/[0.06] bg-[#151515] px-3 py-2 text-[12px]">
      <span className="text-[#8c8c8c]">{label}</span>
      <span className={cn('truncate text-right', toneClass)}>{value}</span>
    </div>
  );
}

type SidebarTone = 'muted' | 'success' | 'warn' | 'danger';

function toneForThreat(value: number): SidebarTone {
  return value > 60 ? 'danger' : value > 32 ? 'warn' : 'success';
}

function toneForConfidence(value: number): SidebarTone {
  return value > 74 ? 'success' : value > 48 ? 'warn' : 'danger';
}

function toneForTrust(value: string): SidebarTone {
  if (value === 'trusted') return 'success';
  if (value === 'degraded') return 'warn';
  if (value === 'contested' || value === 'fail-secure') return 'danger';
  return 'muted';
}

function toneForMode(value: string): SidebarTone {
  if (value === 'Simulated') return 'success';
  if (value === 'Recovery') return 'warn';
  if (value === 'Contested') return 'danger';
  return 'danger';
}
