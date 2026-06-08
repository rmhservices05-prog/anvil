import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge } from '../../components/ui';
import { SimulationState } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const tabs = ['mixed attack', 'corruption', 'jamming', 'reorder', 'handshake fragility'] as const;

export function ProtocolAnalysisScreen({ state }: { state: SimulationState }) {
  const data = state.protocolMetrics.map((item) => ({
    protocol: item.protocol,
    usable: item.usableDelivery,
    wrong: item.wrongAcceptance,
    failSecure: item.failSecureTransitions,
    recovery: item.recoveryTime * 4,
  }));
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Protocol Analysis"
        title="Data-rich comparison under mixed attack conditions"
        description="An honest comparison of usable command delivery, wrong-command acceptance, fail-secure transitions, and recovery time by protocol."
        tag="Engineering truth"
      />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab, index) => (
            <Badge key={tab} tone={index === 0 ? 'amber' : 'muted'}>{tab}</Badge>
          ))}
        </div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="protocol" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0b1116', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#e5e7eb' }} />
              <Legend />
              <Bar dataKey="usable" fill="#f9a93a" />
              <Bar dataKey="wrong" fill="#ff6f61" />
              <Bar dataKey="failSecure" fill="#94a3b8" />
              <Bar dataKey="recovery" fill="#4fd0b0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="space-y-3">
        <div className="micro-label">Honest comparison note</div>
        <p className="text-sm leading-6 text-slate-300">
          DQSP / Lineage does not magically beat packet erasure physics. It wins on trusted authority continuity, corruption tolerance, no-handshake operation, and fail-secure control behaviour.
        </p>
      </Card>
    </div>
  );
}
