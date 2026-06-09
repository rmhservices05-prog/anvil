import { Badge } from './ui';
import { TrustMetrics } from '../types';
import { formatPercent } from '../lib/seed';

export function TrustStrip({ metrics }: { metrics: TrustMetrics }) {
  const items = [
    { label: 'Verified command rate', value: formatPercent(metrics.verifiedCommandRate) },
    { label: 'Rejected hostile attempts', value: `${Math.round(metrics.rejectedHostileAttempts)}` },
    { label: 'Integrity continuity', value: formatPercent(metrics.integrityContinuity) },
    { label: 'Current authority', value: metrics.authorityState },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="micro-label">Trust strip</div>
          <div className="text-[13px] font-medium text-[#f3f3f3]">Compact authority snapshot</div>
        </div>
        <Badge tone={metrics.authorityState === 'trusted' ? 'success' : metrics.authorityState === 'recovery' || metrics.authorityState === 'degraded' ? 'warn' : 'danger'}>
          {metrics.authorityState}
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="border border-white/[0.07] bg-[#151515] px-3 py-3">
            <div className="micro-label">{item.label}</div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="font-mono text-[16px] leading-none text-[#f3f3f3]">{item.value}</div>
              {item.label === 'Current authority' ? <Badge tone="success">Live</Badge> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
