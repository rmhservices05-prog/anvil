import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge } from '../../components/ui';
import { SimulationState } from '../../types';

export function GuardrailsScreen({ state }: { state: SimulationState }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guardrails"
        title="Fail-secure mission rule enforcement"
        description="Make the retained guardrail behavior visible: rejected rewrites, stale authority denial, and fallback policy activation under pressure."
        tag="Fail-secure"
      />
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="space-y-4">
          <div className="micro-label">State badge</div>
          <div className="inline-flex">
            <Badge tone={state.metrics.guardrailLock === 'locked' ? 'danger' : state.mode === 'Recovery' ? 'amber' : 'success'}>{state.metrics.guardrailLock}</Badge>
          </div>
          <div className="text-sm leading-6 text-slate-300">
            When trust continuity weakens, the system falls back to the last verified guardrails rather than accepting stale or rewritten authority.
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="micro-label">Mission rules</div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/6">
              {[
                ['Authenticated command only', 'Required'],
                ['Guardrail rewrite allowed', 'No'],
                ['Stale authority accepted', 'No'],
                ['Operator revalidation', 'Required on fail-secure'],
                ['Fallback to LKG', 'Yes'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-3 text-slate-300">{label}</td>
                  <td className="py-3 text-right font-medium text-white">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          'Attempted rewrite rejected',
          'Stale authority rejected',
          'Fallback policy activated',
        ].map((label) => (
          <Card key={label} className="space-y-2">
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="text-sm text-slate-400">Logged as a non-negotiable transition in the trusted command chain.</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
