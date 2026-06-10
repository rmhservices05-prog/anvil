import { Badge } from './ui';
import { TrustMetrics } from '../types';
import { formatPercent } from '../lib/seed';
import { Activity, Lock, Shield, ShieldAlert } from 'lucide-react';

export function TrustStrip({ metrics }: { metrics: TrustMetrics }) {
  const items = [
    { label: 'Verified command rate', value: formatPercent(metrics.verifiedCommandRate), icon: <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" /> },
    { label: 'Rejected hostile attempts', value: `${Math.round(metrics.rejectedHostileAttempts)}`, icon: <ShieldAlert size={13} strokeWidth={2.2} className="text-[#4f8cff]" /> },
    { label: 'Integrity continuity', value: formatPercent(metrics.integrityContinuity), icon: <Lock size={13} strokeWidth={2.2} className="text-[#4f8cff]" /> },
    { label: 'Current authority', value: metrics.authorityState, icon: <Activity size={13} strokeWidth={2.2} className="text-[#4f8cff]" /> },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Trust strip</div>
          </div>
          <div className="text-[13px] font-medium text-[#f3f3f3]">Compact authority snapshot</div>
        </div>
        <Badge tone={metrics.authorityState === 'trusted' ? 'success' : metrics.authorityState === 'recovery' || metrics.authorityState === 'degraded' ? 'warn' : 'danger'}>
          {metrics.authorityState}
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="border border-white/[0.07] bg-[#151515] px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247]">
                {item.icon}
              </span>
              <div className="micro-label">{item.label}</div>
            </div>
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
