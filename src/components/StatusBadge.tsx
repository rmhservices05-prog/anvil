import { Badge } from './ui';
import { TrustState } from '../types';

export function StatusBadge({ state }: { state: TrustState | 'Simulated' | 'Contested' | 'Recovery' | 'Fail-secure' }) {
  const choice =
    state === 'trusted'
      ? { tone: 'success' as const, label: 'Trusted' }
      : state === 'degraded'
        ? { tone: 'warn' as const, label: 'Degraded' }
        : state === 'contested' || state === 'Contested'
          ? { tone: 'danger' as const, label: 'Contested' }
          : state === 'recovery' || state === 'Recovery'
            ? { tone: 'amber' as const, label: 'Recovery' }
            : state === 'fail-secure' || state === 'Fail-secure'
              ? { tone: 'danger' as const, label: 'Fail-secure' }
              : { tone: 'muted' as const, label: 'Simulated' };
  return <Badge tone={choice.tone}>{choice.label}</Badge>;
}
