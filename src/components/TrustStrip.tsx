import { Badge } from './ui';
import { TrustMetrics } from '../types';
import { formatPercent } from '../lib/seed';

export function TrustStrip({ metrics }: { metrics: TrustMetrics }) {
  const items = [
    { label: 'Verified command rate', value: formatPercent(metrics.verifiedCommandRate) },
    { label: 'Rejected hostile attempts', value: `${Math.round(metrics.rejectedHostileAttempts)}` },
    { label: 'Integrity continuity', value: formatPercent(metrics.integrityContinuity) },
    { label: 'Current authority', value: metrics.authorityState },
    { label: 'Guardrail lock', value: metrics.guardrailLock },
    { label: 'Last verified epoch', value: `${metrics.lastVerifiedEpoch} / T-${metrics.lineageTick}` },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/6 bg-white/4 p-4">
          <div className="micro-label">{item.label}</div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="text-lg font-semibold text-white">{item.value}</div>
            {item.label === 'Current authority' ? <Badge tone="success">Live</Badge> : null}
            {item.label === 'Guardrail lock' ? <Badge tone="amber">Retained</Badge> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
