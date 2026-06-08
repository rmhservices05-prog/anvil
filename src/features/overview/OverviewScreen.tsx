import { AttackLog } from '../../components/AttackLog';
import { GuardrailCard } from '../../components/GuardrailCard';
import { MetricCard } from '../../components/MetricCard';
import { ProtocolTable } from '../../components/ProtocolTable';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { ThreatGauge } from '../../components/ThreatGauge';
import { TrustStrip } from '../../components/TrustStrip';
import { Card } from '../../components/ui';
import { SimulationState } from '../../types';
import { formatPercent } from '../../lib/seed';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function OverviewScreen({
  state,
  onSelectEvent,
}: {
  state: SimulationState;
  onSelectEvent: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Overview"
        title="Mission trust and authority continuity"
        description="A defence-grade validation console that keeps the focus on authenticated command authority, rejected hostile attempts, lineage continuity, and fail-secure recovery."
        tag={state.headline}
      />
      <TrustStrip metrics={state.metrics} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro-label">Live attack pressure</div>
              <div className="text-base font-semibold text-white">Streaming response to contested-spectrum stress</div>
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
            <div className="micro-label">Command authority outcome</div>
            <div className="text-2xl font-semibold text-white">{state.headline}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-slate-400">Accepted</div>
                <div className="mt-1 text-white">{Math.round(state.metrics.verifiedCommandRate * 1.1)}</div>
              </div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-slate-400">Rejected</div>
                <div className="mt-1 text-white">{Math.round(state.metrics.rejectedHostileAttempts)}</div>
              </div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-slate-400">Contested intervals</div>
                <div className="mt-1 text-white">{Math.max(1, Math.round(state.threatPressure / 9))}</div>
              </div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-slate-400">Fallback events</div>
                <div className="mt-1 text-white">{state.mode === 'Recovery' || state.mode === 'Fail-secure' ? 2 : 1}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <ProtocolTable metrics={state.protocolMetrics} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AttackLog events={state.attackEvents.slice(0, 12)} onSelect={(event) => onSelectEvent(event.id)} />
        <GuardrailCard guardrails={state.guardrails} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Operator confidence" value={formatPercent(state.confidence)} subvalue="Derived from hostile pressure, auth continuity, and guardrail retention." tone={state.trustState === 'trusted' ? 'trust' : 'amber'} progress={state.confidence} />
        <MetricCard label="Integrity continuity" value={formatPercent(state.metrics.integrityContinuity)} subvalue="Rejects stale, replayed, or unsafe authority transitions." tone="trust" progress={state.metrics.integrityContinuity} />
        <MetricCard label="Guardrail retention" value={state.metrics.guardrailLock} subvalue="Last verified guardrails remain bound to the local operator policy." tone={state.metrics.guardrailLock === 'locked' ? 'hostile' : 'amber'} progress={state.metrics.rejectedHostileAttempts} />
      </div>
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
