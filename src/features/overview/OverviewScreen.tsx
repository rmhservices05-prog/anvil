import { AttackLog } from '../../components/AttackLog';
import { GuardrailCard } from '../../components/GuardrailCard';
import { MetricCard } from '../../components/MetricCard';
import { ProtocolTable } from '../../components/ProtocolTable';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { ThreatGauge } from '../../components/ThreatGauge';
import { Badge, Button, Card } from '../../components/ui';
import { SimulationState } from '../../types';
import { Activity, Clock3, Download, Eye, FileText, Lock, Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function OverviewScreen({
  state,
  onSelectEvent,
  onSelectEvidence,
  focusSummary,
  onStart,
  onConnect,
  onPause,
  onResume,
  onStep,
  onToggleReview,
  onExport,
  onReset,
}: {
  state: SimulationState;
  onSelectEvent: (id: string) => void;
  onSelectEvidence: (id: string) => void;
  focusSummary: {
    scenario: string;
    environment: string;
    epoch: string;
    workflow: string;
  };
  onStart: () => void;
  onConnect: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onToggleReview: () => void;
  onExport: () => void;
  onReset: () => void;
}) {
  const recentTimeline = state.timeline.slice(-4).reverse();
  const recentEvidence = state.evidence.slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="space-y-4 bg-[#111111]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <div className="micro-label">Controls</div>
            <div className="text-[13px] font-medium text-[#f3f3f3]">Shared runtime actions</div>
          </div>
          <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" onClick={onStart} className="min-w-[128px] justify-start">
            <Play size={15} />
            Start
          </Button>
          <Button variant="outline" onClick={onConnect} className="min-w-[128px] justify-start">
            <ShieldAlert size={15} />
            Connect
          </Button>
          <Button variant="ghost" onClick={onPause} className="min-w-[128px] justify-start">
            <Pause size={15} />
            Pause
          </Button>
          <Button variant="ghost" onClick={onResume} className="min-w-[128px] justify-start">
            <Play size={15} />
            Resume
          </Button>
          <Button variant="outline" onClick={onStep} className="min-w-[128px] justify-start">
            <Clock3 size={15} />
            Step
          </Button>
          <Button variant="outline" onClick={onToggleReview} className="min-w-[128px] justify-start">
            <Eye size={15} />
            Review
          </Button>
          <Button variant="amber" onClick={onExport} className="min-w-[128px] justify-start">
            <Download size={15} />
            Export
          </Button>
          <Button variant="danger" onClick={onReset} className="min-w-[128px] justify-start">
            <RotateCcw size={15} />
            Reset
          </Button>
        </div>
      </Card>

      <SectionHeader
        eyebrow="Overview"
        title="Mission trust and authority continuity"
        description="Session state, alerts, and evidence at a glance."
        tag={state.session.phase}
        icon={<Activity size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="micro-label">Snapshot</div>
            <div className="text-sm text-slate-400">Scenario, environment, epoch, workflow</div>
          </div>
          <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
        </div>
        <div className="grid gap-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col items-start justify-start gap-1 px-3 py-3 text-left">
            <span className="micro-label">Scenario</span>
            <span className="text-sm font-medium text-white">{focusSummary.scenario}</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start justify-start gap-1 px-3 py-3 text-left">
            <span className="micro-label">Environment</span>
            <span className="text-sm font-medium text-white">{focusSummary.environment}</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start justify-start gap-1 px-3 py-3 text-left">
            <span className="micro-label">Current epoch</span>
            <span className="text-sm font-medium text-white">{focusSummary.epoch}</span>
          </Button>
          <Button variant="default" className="h-auto flex-col items-start justify-start gap-1 px-3 py-3 text-left">
            <span className="micro-label text-white/70">Workflow stage</span>
            <span className="text-sm font-medium text-white">{focusSummary.workflow}</span>
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="micro-label">Session metrics</div>
              <div className="text-base font-semibold text-white">Current runtime state</div>
            </div>
            <StatusBadge state={state.trustState} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Phase" value={state.session.phase} subvalue="Console lifecycle state" tone="amber" icon={<Clock3 size={13} strokeWidth={2.2} className="text-[#4f8cff]" />} />
            <MetricCard label="Connection" value={state.connectionState} subvalue="Derived connection state" tone={state.connectionState === 'connected' ? 'trust' : 'hostile'} icon={<Activity size={13} strokeWidth={2.2} className="text-[#4f8cff]" />} />
            <MetricCard label="Alerts" value={`${state.summary.alertCount}`} subvalue="Unacknowledged console alerts" tone={state.summary.alertCount > 0 ? 'hostile' : 'trust'} icon={<ShieldAlert size={13} strokeWidth={2.2} className="text-[#4f8cff]" />} />
            <MetricCard label="Evidence" value={`${state.summary.evidenceCount}`} subvalue="Export-ready evidence items" tone="amber" icon={<FileText size={13} strokeWidth={2.2} className="text-[#4f8cff]" />} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={state.connectionState === 'connected' ? 'success' : 'warn'}>{state.connectionState}</Badge>
            <Badge tone={state.reviewMode ? 'amber' : 'muted'}>{state.reviewMode ? 'review mode' : 'live mode'}</Badge>
            <Button variant="outline" onClick={() => onSelectEvidence(state.evidence[0]?.id ?? '')} disabled={!state.evidence.length}>
              Inspect evidence
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="micro-label">Scenario</div>
          <div className="text-sm font-semibold text-white">{state.scenario.title}</div>
          <div className="text-sm leading-6 text-slate-400">{state.scenario.subtitle}</div>
          <div className="flex flex-wrap gap-2">
            {state.scenario.tags.map((tag) => (
              <Badge key={tag} tone="muted">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Epoch" value={state.metrics.lastVerifiedEpoch} />
            <MiniStat label="Workflow" value={focusSummary.workflow} />
            <MiniStat label="Mode" value={state.mode} />
            <MiniStat label="Trust" value={state.trustState} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro-label">Live attack pressure</div>
              <div className="text-base font-semibold text-white">Streaming response</div>
            </div>
            <StatusBadge state={state.mode} />
          </div>
          <div className="mt-4 h-[320px]">
            <LiveAttackChart series={state.series} />
          </div>
        </Card>
        <div className="space-y-4">
          <ThreatGauge value={state.threatPressure} />
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                <Lock size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
              </span>
              <div className="micro-label">Result</div>
            </div>
            <div className="text-xl font-semibold text-white">{state.headline}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <MiniStat label="Accepted" value={`${Math.round(state.metrics.verifiedCommandRate * 1.1)}`} />
              <MiniStat label="Rejected" value={`${Math.round(state.metrics.rejectedHostileAttempts)}`} />
              <MiniStat label="Contested" value={`${Math.max(1, Math.round(state.threatPressure / 9))}`} />
              <MiniStat label="Fallbacks" value={`${state.mode === 'Recovery' || state.mode === 'Fail-secure' ? 2 : 1}`} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro-label">Recent timeline</div>
              <div className="text-base font-semibold text-white">Latest state transitions and operator actions</div>
            </div>
            <Badge tone="amber">{recentTimeline.length} entries</Badge>
          </div>
          <div className="space-y-2">
            {recentTimeline.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelectEvent(entry.id)}
                className="flex w-full items-start justify-between gap-4 border border-white/[0.06] bg-[#151515] px-3 py-2 text-left transition hover:border-amber-500/30 hover:bg-[#181818]"
              >
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[#8c8c8c]">{entry.timestamp}</div>
                  <div className="mt-1 text-[12px] font-medium text-[#f3f3f3]">{entry.title}</div>
                  <div className="mt-1 text-[11px] leading-5 text-[#8c8c8c]">{entry.details}</div>
                </div>
                <Badge tone={entry.severity === 'critical' ? 'danger' : entry.severity === 'warn' ? 'warn' : 'success'}>{entry.type}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro-label">Evidence</div>
              <div className="text-base font-semibold text-white">Ready for export</div>
            </div>
            <Badge tone={state.summary.evidenceCount > 0 ? 'success' : 'muted'}>{state.summary.evidenceCount}</Badge>
          </div>
          <div className="space-y-2">
            {recentEvidence.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectEvidence(item.id)}
                className="w-full rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <Badge tone={item.severity === 'critical' ? 'danger' : item.severity === 'warn' ? 'warn' : 'success'}>{item.category}</Badge>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{item.summary}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <ProtocolTable metrics={state.protocolMetrics} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AttackLog events={state.attackEvents.slice(0, 12)} onSelect={(event) => onSelectEvent(event.id)} />
        <GuardrailCard guardrails={state.guardrails} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-white/[0.07] bg-[#151515] p-3">
      <div className="micro-label">{label}</div>
      <div className="mt-2 font-mono text-[14px] text-[#f3f3f3]">{value}</div>
    </div>
  );
}

function LiveAttackChart({ series }: { series: SimulationState['series'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series}>
        <defs>
          <linearGradient id="jamming" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f9a93a" stopOpacity={0.55} />
            <stop offset="95%" stopColor="#f9a93a" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="corruption" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6f61" stopOpacity={0.55} />
            <stop offset="95%" stopColor="#ff6f61" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="spoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4fd0b0" stopOpacity={0.55} />
            <stop offset="95%" stopColor="#4fd0b0" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="tick" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0b1116', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#e5e7eb' }} />
        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
        <Area type="monotone" dataKey="jamming" name="Jamming intensity" stroke="#f9a93a" fill="url(#jamming)" strokeWidth={2} />
        <Area type="monotone" dataKey="corruption" name="Packet corruption" stroke="#ff6f61" fill="url(#corruption)" strokeWidth={2} />
        <Area type="monotone" dataKey="spoof" name="Spoof attempt density" stroke="#4fd0b0" fill="url(#spoof)" strokeWidth={2} />
        <Area type="monotone" dataKey="reorder" name="Reorder pressure" stroke="#cbd5e1" fillOpacity={0} strokeWidth={2} />
        <Area type="monotone" dataKey="recovery" name="Trust recovery time" stroke="#94a3b8" fillOpacity={0} strokeWidth={2} strokeDasharray="6 4" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
