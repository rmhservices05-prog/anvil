import { Card, Progress } from './ui';
import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  subvalue,
  tone = 'amber',
  progress,
  icon,
}: {
  label: string;
  value: string;
  subvalue?: string;
  tone?: 'amber' | 'trust' | 'hostile';
  progress?: number;
  icon?: ReactNode;
}) {
  return (
    <Card className="relative space-y-3 border-white/[0.07] bg-[#171717]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">{icon}</span> : null}
          <div className="micro-label">{label}</div>
        </div>
        <div className="h-2 w-2 border border-white/25 bg-white/5" />
      </div>
      <div className="metric-value">{value}</div>
      {subvalue ? <div className="text-[11px] text-[#8c8c8c]">{subvalue}</div> : null}
      {typeof progress === 'number' ? <Progress value={progress} tone={tone} /> : null}
    </Card>
  );
}
