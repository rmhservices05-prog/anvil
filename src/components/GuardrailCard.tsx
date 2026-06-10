import { GuardrailItem } from '../types';
import { Badge, Card } from './ui';
import { Shield } from 'lucide-react';

export function GuardrailCard({ guardrails }: { guardrails: GuardrailItem[] }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Guardrail state</div>
          </div>
          <div className="text-base font-semibold text-white">Last verified guardrails retained</div>
        </div>
        <Badge tone="success">Retained</Badge>
      </div>
      <div className="space-y-3">
        {guardrails.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">{item.label}</div>
              <Badge tone={item.state === 'locked' ? 'danger' : item.state === 'retained' ? 'success' : 'warn'}>{item.state}</Badge>
            </div>
            <div className="mt-2 text-sm text-slate-400">{item.detail}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
