import { ProtocolMetric } from '../types';
import { Card, Badge } from './ui';
import { cn } from '../lib/utils';
import { Database } from 'lucide-react';

const rows = [
  { key: 'survivesCorruption', label: 'Survives corruption' },
  { key: 'handshakeDependency', label: 'Handshake dependency' },
  { key: 'perMessageAuth', label: 'Per-message authentication' },
  { key: 'captureExposure', label: 'Capture exposure' },
  { key: 'recoveryUnderMixedAttack', label: 'Recovery under mixed attack' },
  { key: 'authorityContinuity', label: 'Authority continuity' },
] as const;

export function ProtocolTable({ metrics }: { metrics: ProtocolMetric[] }) {
  const best = 'DQSP / Lineage';
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <Database size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Protocol comparison snapshot</div>
          </div>
          <div className="text-base font-semibold text-white">Authority continuity under contested-spectrum stress</div>
        </div>
        <Badge tone="amber">Engineering view</Badge>
      </div>
      <div className="thin-scrollbar overflow-x-auto">
        <table className="min-w-[920px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-white/3">
              <th className="sticky left-0 z-10 bg-panel px-4 py-3 text-left text-xs uppercase tracking-[0.22em] text-slate-400">Metric</th>
              {metrics.map((item) => (
                <th key={item.protocol} className={cn('px-4 py-3 text-left text-sm font-semibold text-white', item.protocol === best ? 'bg-amber-500/8' : '')}>
                  <div className="flex items-center gap-2">
                    <span>{item.protocol}</span>
                    {item.protocol === best ? <Badge tone="success">Preferred</Badge> : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-white/6">
                <td className="sticky left-0 z-10 bg-panel px-4 py-3 text-sm text-slate-300">{row.label}</td>
                {metrics.map((item) => {
                  const value = item[row.key];
                  return (
                    <td key={item.protocol + row.key} className={cn('px-4 py-3 text-sm', item.protocol === best ? 'bg-amber-500/5' : '')}>
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-slate-100">{Math.round(value as number)}%</span>
                        <div className="h-1.5 flex-1 rounded-full bg-white/6">
                          <div className={cn('h-full rounded-full', item.protocol === best ? 'bg-gradient-to-r from-amber-400 to-trust' : 'bg-gradient-to-r from-slate-500 to-slate-300')} style={{ width: `${Math.max(6, Math.min(100, value as number))}%` }} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/6 px-4 py-3 text-xs leading-6 text-slate-400">
        DQSP / Lineage stands out on authority continuity and recovery behavior without pretending packet loss is free. The comparison is conservative by design.
      </div>
    </Card>
  );
}
