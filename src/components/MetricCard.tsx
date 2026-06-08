import { Card, Progress } from './ui';

export function MetricCard({
  label,
  value,
  subvalue,
  tone = 'amber',
  progress,
}: {
  label: string;
  value: string;
  subvalue?: string;
  tone?: 'amber' | 'trust' | 'hostile';
  progress?: number;
}) {
  return (
    <Card className="space-y-3">
      <div className="micro-label">{label}</div>
      <div className="metric-value">{value}</div>
      {subvalue ? <div className="text-sm text-slate-400">{subvalue}</div> : null}
      {typeof progress === 'number' ? <Progress value={progress} tone={tone} /> : null}
    </Card>
  );
}
