import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge, Button } from '../../components/ui';
import { ProtocolName, SimulationState } from '../../types';
import { Database } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const protocols = ['DQSP / Lineage', 'AES-PSK', 'AES-GCM', 'ECDH + GCM', 'ML-KEM + GCM'] as const;

export function ProtocolAnalysisScreen({
  state,
  onFilter,
  onToggleComparison,
}: {
  state: SimulationState;
  onFilter: (protocol?: ProtocolName) => void;
  onToggleComparison: () => void;
}) {
  const selectedProtocol = state.layout.filters.protocol;
  const comparisonMode = Boolean(state.layout.filters.comparisonMode);
  const data = state.protocolMetrics
    .filter((item) => !selectedProtocol || item.protocol === selectedProtocol)
    .map((item) => ({
      protocol: item.protocol,
      usable: item.usableDelivery,
      wrong: item.wrongAcceptance,
      failSecure: item.failSecureTransitions,
      recovery: item.recoveryTime * 4,
      authority: item.authorityContinuity,
    }));

  const selectedRow = state.protocolMetrics.find((item) => item.protocol === selectedProtocol) ?? state.protocolMetrics[0]!;
  const selectProtocolFromBar = (eventData: unknown) => {
    const protocol = (eventData as { payload?: { protocol?: ProtocolName } } | undefined)?.payload?.protocol;
    if (protocol) onFilter(protocol);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Comparison"
        title="How different solutions respond to the attack"
        description="Filter and compare the response profile of each solution under the current attack."
        tag={comparisonMode ? 'comparison' : 'single view'}
        icon={<Database size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                <Database size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
              </span>
              <div className="micro-label">Protocol filtering</div>
            </div>
            <div className="text-base font-semibold text-white">Numbers and labels are tied to the live session state</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={!selectedProtocol ? 'amber' : 'outline'} selected={!selectedProtocol} onClick={() => onFilter(undefined)}>
              All
            </Button>
            <Button variant={comparisonMode ? 'amber' : 'outline'} selected={comparisonMode} onClick={onToggleComparison}>
              Comparison mode
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {protocols.map((protocol) => (
            <Button key={protocol} variant={selectedProtocol === protocol ? 'amber' : 'outline'} selected={selectedProtocol === protocol} onClick={() => onFilter(protocol)}>
              {protocol}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="micro-label">Protocol comparison snapshot</div>
              <div className="text-base font-semibold text-white">Authority continuity under contested-spectrum stress</div>
            </div>
            <Badge tone={state.threatPressure > 60 ? 'warn' : 'success'}>Threat {Math.round(state.threatPressure)}</Badge>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="protocol" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0b1116', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#e5e7eb' }} />
                <Legend />
                <Bar dataKey="usable" fill="#f9a93a" onClick={selectProtocolFromBar} cursor="pointer" />
                <Bar dataKey="wrong" fill="#ff6f61" onClick={selectProtocolFromBar} cursor="pointer" />
                <Bar dataKey="failSecure" fill="#94a3b8" onClick={selectProtocolFromBar} cursor="pointer" />
                <Bar dataKey="recovery" fill="#4fd0b0" onClick={selectProtocolFromBar} cursor="pointer" />
                <Bar dataKey="authority" fill="#72c8a0" onClick={selectProtocolFromBar} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="micro-label">Selected protocol details</div>
          <div className="text-lg font-semibold text-white">{selectedRow.protocol}</div>
          <div className="space-y-2">
            <MetricLine label="Usable delivery" value={`${Math.round(selectedRow.usableDelivery)}%`} detail="Higher is better under pressure." />
            <MetricLine label="Wrong acceptance" value={`${Math.round(selectedRow.wrongAcceptance)}%`} detail="Lower is better; incorrect acceptance is a risk." />
            <MetricLine label="Authority continuity" value={`${Math.round(selectedRow.authorityContinuity)}%`} detail="Reflects continuation of trusted command authority." />
            <MetricLine label="Recovery time" value={`${Math.round(selectedRow.recoveryTime)}s`} detail="Lower is better when the channel degrades." />
          </div>
          <div className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="micro-label">Why it behaves this way</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              {selectedProtocol === 'DQSP / Lineage'
                ? 'DQSP / Lineage keeps continuity high because the ledger stays locally verifiable.'
                : 'This protocol is more exposed to handshake dependence and wrong acceptance.'}
            </div>
          </div>
          <div className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="micro-label">Live session effect</div>
            <div className="mt-2 space-y-1 text-sm text-slate-300">
              <div>Confidence: {Math.round(state.confidence)}%</div>
              <div>Connection: {state.connectionState}</div>
              <div>Guardrail lock: {state.metrics.guardrailLock}</div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}

function MetricLine({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
      <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
    </div>
  );
}
