import {
  AttackType,
  AttackEvent,
  CommandAttempt,
  ConnectionState,
  ConsoleAlert,
  EnvironmentId,
  EvidenceItem,
  ExercisePhase,
  LineageBranch,
  NetworkLink,
  NetworkNode,
  ProtocolMetric,
  Scenario,
  SessionEventType,
  SessionPhase,
  SessionTimelineEntry,
  SelectedDetail,
  SimulationState,
  TrustState,
} from '../types';
import { clamp, mulberry32, range } from '../lib/seed';

export const environments: { id: EnvironmentId; label: string; summary: string }[] = [
  { id: 'surface-rf', label: 'Surface RF', summary: 'Low-altitude contested line of sight with burst interference.' },
  { id: 'ground-air', label: 'Ground / Air', summary: 'Mixed mobility command links with relay fallbacks.' },
  { id: 'space', label: 'Space', summary: 'Delayed and fragmented authority across long-haul relays.' },
  { id: 'subsurface', label: 'Subsurface', summary: 'Extremely constrained propagation and delayed returns.' },
  { id: 'mesh-relay', label: 'Mesh Relay', summary: 'Distributed control with dynamic node trust shifts.' },
];

export const phases: ExercisePhase[] = ['nominal', 'light-interference', 'spoofing-onset', 'mixed-attack', 'fail-secure', 'recovery'];

export const attackPresets: { id: AttackType; label: string; description: string; intent: string }[] = [
  { id: 'spoofed-commands', label: 'Spoofed commands', description: 'Mimic valid operator signatures and timing cadence.', intent: 'force false command' },
  { id: 'replay-attack', label: 'Replay attack', description: 'Repeat previously accepted traffic with timing drift.', intent: 'deny command' },
  { id: 'burst-jamming', label: 'Burst jamming', description: 'Concentrated interference bursts around command windows.', intent: 'exhaust trust' },
  { id: 'bit-corruption', label: 'Bit corruption', description: 'Selective payload corruption under adverse link quality.', intent: 'trigger unsafe state' },
  { id: 'reorder-attack', label: 'Reorder attack', description: 'Manipulate message sequencing to create ambiguity.', intent: 'split operator from platform' },
  { id: 'authority-overwrite', label: 'Authority overwrite attempt', description: 'Try to replace verified operator authority.', intent: 'force false command' },
  { id: 'lineage-desync', label: 'Lineage desync attempt', description: 'Fork state and desynchronize accepted branches.', intent: 'split operator from platform' },
  { id: 'epoch-poisoning', label: 'Epoch poisoning attempt', description: 'Feed invalid epoch material to corrupt continuity.', intent: 'trigger unsafe state' },
];

export const scenarioCatalog: Scenario[] = [
  {
    id: 'baseline-contested',
    title: 'Blackridge Relay Validation',
    subtitle: 'Resilient command authority under mixed AI-generated attack chains.',
    environment: 'mesh-relay',
    tags: ['Lineage', 'Fail-secure', 'Recovery'],
    doctrine: 'Trusted authority continuity with local fallback guardrails.',
  },
  {
    id: 'eastern-surface',
    title: 'Eastline Surface RF Exercise',
    subtitle: 'Surface spectrum suppression with spoof and corruption pressure.',
    environment: 'surface-rf',
    tags: ['Jamming', 'Spoofing', 'Guardrails'],
    doctrine: 'Reject hostile inputs and preserve last verified state.',
  },
  {
    id: 'orbital-chain',
    title: 'Apex Orbital Disruption Test',
    subtitle: 'Delayed, intermittent authority with recovery over long-haul links.',
    environment: 'space',
    tags: ['Delay', 'Epoch', 'Continuity'],
    doctrine: 'Preserve authority continuity despite transient control loss.',
  },
];

export const scenarios = scenarioCatalog;

export function scenarioForEnvironment(environment: EnvironmentId) {
  const byEnv: Record<EnvironmentId, Scenario> = {
    'surface-rf': scenarioCatalog[1]!,
    'ground-air': {
      id: 'ground-air-guard',
      title: 'Sentinel Corridor Exercise',
      subtitle: 'Cross-domain authority under relay churn and mixed attack pressure.',
      environment,
      tags: ['Relay', 'Recovery', 'Operator Trust'],
      doctrine: 'Guardrail retention with verified authority transitions.',
    },
    space: scenarioCatalog[2]!,
    subsurface: {
      id: 'subsurface-redoubt',
      title: 'Redoubt Subsurface Validation',
      subtitle: 'Minimal connectivity with stringent rejection of stale authority.',
      environment,
      tags: ['Latency', 'Stale Inputs', 'Fail-secure'],
      doctrine: 'Local safe-return policy when trust continuity is interrupted.',
    },
    'mesh-relay': scenarioCatalog[0]!,
  };
  return byEnv[environment];
}

export function deriveSessionPhase(state: Pick<SimulationState, 'reviewMode' | 'isRunning' | 'exportStatus' | 'timeElapsed' | 'confidence'>): SessionPhase {
  if (state.exportStatus === 'success') return 'exporting';
  if (state.reviewMode) return 'review';
  if (!state.isRunning && state.timeElapsed === 0) return 'idle';
  if (!state.isRunning && state.timeElapsed > 0) return state.confidence < 58 ? 'degraded' : 'recovering';
  if (state.timeElapsed < 2) return 'preparing';
  if (state.confidence < 42) return 'degraded';
  return 'running';
}

export function deriveConnectionState(state: Pick<SimulationState, 'attackTypes' | 'threatPressure' | 'confidence' | 'reviewMode' | 'isRunning'>): ConnectionState {
  if (state.reviewMode) return 'connected';
  if (!state.isRunning) return state.threatPressure > 0 ? 'disconnected' : 'lost';
  if (state.confidence < 28) return 'lost';
  if (state.threatPressure > 72) return 'degraded';
  return 'connected';
}

export function deriveTrustStateFromSession(confidence: number, threat: number, exercisePhase: ExercisePhase): TrustState {
  if (exercisePhase === 'fail-secure') return 'fail-secure' as const;
  if (exercisePhase === 'recovery') return confidence > 55 ? 'recovery' : 'contested';
  if (confidence >= 78 && threat < 28) return 'trusted';
  if (confidence >= 54) return 'degraded';
  return 'contested';
}

export function deriveAlertSeverity(level: 'info' | 'warn' | 'critical', threatPressure: number, confidence: number) {
  if (level === 'critical') return 'critical' as const;
  if (threatPressure > 66 || confidence < 42) return 'critical' as const;
  if (threatPressure > 34 || confidence < 68) return 'warn' as const;
  return 'info' as const;
}

export function deriveEvidenceCategory(source: string): EvidenceItem['category'] {
  if (source.includes('scenario')) return 'scenario';
  if (source.includes('alert')) return 'alert';
  if (source.includes('lineage')) return 'lineage';
  if (source.includes('protocol')) return 'protocol';
  if (source.includes('guardrail')) return 'guardrail';
  if (source.includes('export')) return 'export';
  return 'timeline';
}

export function exportSummaryText(state: Pick<SimulationState, 'headline' | 'confidence' | 'threatPressure' | 'sessionPhase' | 'connectionState'>) {
  return `${state.headline} | ${Math.round(state.confidence)}% confidence | threat ${Math.round(state.threatPressure)} | ${state.sessionPhase} / ${state.connectionState}`;
}

export function buildSessionTimeline(seed: number, state: Pick<SimulationState, 'timeElapsed' | 'phase' | 'attackTypes' | 'trustState' | 'exportStatus' | 'selectedDetail'>): SessionTimelineEntry[] {
  const rand = mulberry32(seed);
  const events: Array<{ type: SessionEventType; title: string; details: string; severity: SessionTimelineEntry['severity'] }> = [
    {
      type: 'session.started',
      title: 'Session initialized',
      details: `Exercise phase ${state.phase.replace('-', ' ')} staged with ${state.attackTypes.length} active attack primitives.`,
      severity: 'info',
    },
    {
      type: 'attack.armed',
      title: 'Attack chain armed',
      details: state.attackTypes.length > 0 ? `Active vectors: ${state.attackTypes.map((attack) => attack.replace('-', ' ')).join(', ')}` : 'No attack primitives armed yet.',
      severity: state.attackTypes.length > 2 ? 'critical' : 'warn',
    },
    {
      type: 'session.stepped',
      title: 'Runtime step',
      details: `Session tick ${state.timeElapsed} with authority ${state.trustState}.`,
      severity: state.trustState === 'trusted' ? 'info' : 'warn',
    },
    {
      type: 'session.exporting',
      title: 'Evidence stage prepared',
      details: state.exportStatus === 'success' ? 'Export artifact prepared and ready for download.' : 'Export pipeline ready when the operator requests it.',
      severity: state.exportStatus === 'success' ? 'info' : 'warn',
    },
  ];

  return events.map((event, index) => ({
    id: `tl-${seed}-${index}`,
    timestamp: `T+${String(index * 11 + Math.round(rand() * 5)).padStart(3, '0')}s`,
    ...event,
  }));
}

export function buildConsoleAlerts(seed: number, state: Pick<SimulationState, 'threatPressure' | 'confidence' | 'attackTypes' | 'trustState' | 'metrics'>): ConsoleAlert[] {
  const rand = mulberry32(seed + 9);
  const labels = [
    {
      id: 'pressure',
      title: 'Spectrum pressure rising',
      message: `Threat pressure is ${Math.round(state.threatPressure)} under the current attack profile.`,
      level: deriveAlertSeverity('warn', state.threatPressure, state.confidence),
    },
    {
      id: 'lineage',
      title: 'Lineage continuity watch',
      message: state.trustState === 'fail-secure' ? 'Last verified branch is pinned while stale authority is rejected.' : 'Lineage remains coherent, but selected branch drift is under observation.',
      level: deriveAlertSeverity(state.trustState === 'fail-secure' ? 'critical' : 'warn', state.threatPressure, state.confidence),
    },
    {
      id: 'guardrail',
      title: 'Guardrail posture',
      message: state.metrics.guardrailLock === 'locked' ? 'Guardrails are locked and preventing unsafe transitions.' : 'Guardrails remain retained with local fail-secure fallback available.',
      level: deriveAlertSeverity(state.metrics.guardrailLock === 'locked' ? 'critical' : 'info', state.threatPressure, state.confidence),
    },
  ];

  return labels.map((item, index) => ({
    id: `${item.id}-${seed}-${index}`,
    level: item.level,
    title: item.title,
    message: item.message,
    acknowledged: rand() > 0.7 && index === 2,
    timestamp: `T+${String(index * 14).padStart(3, '0')}s`,
  }));
}

export function buildEvidenceItems(seed: number, state: Pick<SimulationState, 'scenario' | 'metrics' | 'headline' | 'attackTypes' | 'timeline' | 'trustState' | 'phase'>): EvidenceItem[] {
  return [
    {
      id: `ev-scenario-${seed}`,
      title: `${state.scenario.title} scenario sheet`,
      timestamp: 'T+000s',
      category: 'scenario',
      summary: state.scenario.subtitle,
      severity: 'info',
      source: 'scenario',
      details: state.scenario.doctrine,
    },
    {
      id: `ev-timeline-${seed}`,
      title: 'Timeline highlight',
      timestamp: 'T+011s',
      category: 'timeline',
      summary: state.headline,
      severity: state.trustState === 'trusted' ? 'info' : 'warn',
      source: 'timeline',
      details: state.timeline.map((entry) => `${entry.timestamp} ${entry.title}`).slice(0, 3).join(' | '),
    },
    {
      id: `ev-alert-${seed}`,
      title: 'Alert posture',
      timestamp: 'T+019s',
      category: 'alert',
      summary: `${state.attackTypes.length} active attack vectors`,
      severity: state.attackTypes.length > 2 ? 'critical' : 'warn',
      source: 'alert',
      details: `Integrity continuity ${Math.round(state.metrics.integrityContinuity)} and authority ${state.trustState}.`,
    },
    {
      id: `ev-protocol-${seed}`,
      title: 'Protocol comparison note',
      timestamp: 'T+028s',
      category: 'protocol',
      summary: 'DQSP / Lineage remains the preferred continuity path under stress.',
      severity: 'info',
      source: 'protocol',
      details: 'Protocol metrics capture survivability, wrong acceptance, and recovery under mixed attack.',
    },
    {
      id: `ev-guardrail-${seed}`,
      title: 'Guardrail disposition',
      timestamp: 'T+034s',
      category: 'guardrail',
      summary: `Guardrail lock is ${state.metrics.guardrailLock}.`,
      severity: state.metrics.guardrailLock === 'locked' ? 'critical' : 'info',
      source: 'guardrail',
      details: 'Fallback policy remains local and deterministic.',
    },
  ];
}

export function buildConnectionLifecycle(seed: number, state: Pick<SimulationState, 'confidence' | 'threatPressure' | 'isRunning'>): Array<{ timestamp: string; state: ConnectionState; title: string }> {
  const rand = mulberry32(seed + 21);
  const sequence: ConnectionState[] = ['disconnected', 'connecting', 'connected', state.threatPressure > 70 ? 'degraded' : 'connected', state.confidence < 30 ? 'lost' : 'connected'];
  return sequence.map((entry, index) => ({
    timestamp: `T+${String(index * 6 + Math.round(rand() * 2)).padStart(3, '0')}s`,
    state: entry,
    title:
      entry === 'disconnected'
        ? 'Console idle'
        : entry === 'connecting'
          ? 'Link handshake underway'
          : entry === 'connected'
            ? 'Operational link established'
            : entry === 'degraded'
              ? 'Link degrades under pressure'
              : 'Link lost, fail-secure engaged',
  }));
}

export function buildMockNodes(seed: number): NetworkNode[] {
  const rand = mulberry32(seed);
  return [
    { id: 'ground-control', label: 'Ground Control', x: 15, y: 50, role: 'control', trust: 94, lineageState: 'verified' },
    { id: 'relay', label: 'Relay', x: 34, y: 38, role: 'relay', trust: 86, lineageState: 'verified' },
    { id: 'drone-alpha', label: 'Drone Alpha', x: 57, y: 28, role: 'platform', trust: 90, lineageState: 'verified' },
    { id: 'drone-bravo', label: 'Drone Bravo', x: 58, y: 66, role: 'platform', trust: 84, lineageState: 'contested' },
    { id: 'edge-sensor', label: 'Edge Sensor', x: 76, y: 48, role: 'sensor', trust: 89, lineageState: 'verified' },
    { id: 'adversary-forge', label: 'Adversary Forge', x: 85, y: 18, role: 'adversary', trust: Math.round(10 + rand() * 8), lineageState: 'quarantined' },
  ];
}

export function buildMockLinks(): NetworkLink[] {
  return [
    { id: 'l1', from: 'ground-control', to: 'relay', trusted: true, intensity: 0.9 },
    { id: 'l2', from: 'relay', to: 'drone-alpha', trusted: true, intensity: 0.8 },
    { id: 'l3', from: 'relay', to: 'drone-bravo', trusted: false, contested: true, intensity: 0.72 },
    { id: 'l4', from: 'drone-alpha', to: 'edge-sensor', trusted: true, intensity: 0.76 },
    { id: 'l5', from: 'adversary-forge', to: 'relay', trusted: false, hostile: true, intensity: 0.95 },
    { id: 'l6', from: 'adversary-forge', to: 'drone-bravo', trusted: false, hostile: true, intensity: 0.82 },
  ];
}

export function buildProtocolMetrics(seed: number): ProtocolMetric[] {
  const rand = mulberry32(seed);
  const names = ['DQSP / Lineage', 'AES-PSK', 'AES-GCM', 'ECDH + GCM', 'ML-KEM + GCM'] as const;
  return names.map((protocol, index) => ({
    protocol,
    survivesCorruption: clamp(40 + index * 10 + rand() * 15, 20, 98),
    handshakeDependency: clamp(92 - index * 10 + rand() * 8, 4, 98),
    perMessageAuth: clamp(46 + index * 8 + rand() * 18, 10, 98),
    captureExposure: clamp(82 - index * 14 + rand() * 10, 8, 96),
    recoveryUnderMixedAttack: clamp(44 + index * 9 + rand() * 13, 14, 96),
    authorityContinuity: clamp(48 + index * 7 + rand() * 20, 18, 99),
    usableDelivery: clamp(72 - index * 8 + rand() * 6, 24, 98),
    wrongAcceptance: clamp(18 - index * 2 + rand() * 5, 1, 28),
    failSecureTransitions: clamp(14 + index * 4 + rand() * 5, 4, 42),
    recoveryTime: clamp(20 - index * 1.5 + rand() * 4, 4, 28),
  }));
}

export function buildLineageBranches(seed: number): LineageBranch[] {
  const rand = mulberry32(seed);
  const branches: LineageBranch[] = [];
  range(8).forEach((index) => {
    branches.push({
      id: `epoch-${101 + index}`,
      epoch: `E-${101 + index}`,
      status:
        index < 4 ? 'verified' : index === 4 ? 'active' : index === 5 ? 'stale' : index === 6 ? 'recovery' : 'quarantined',
      trust: Math.round(95 - index * 7 + rand() * 8),
      acceptanceReason:
        index < 4
          ? 'Public epoch accepted and lineage continuity preserved.'
          : index === 4
            ? 'Current local state advanced from verified input.'
            : index === 5
              ? 'Stale branch rejected after guardrail check.'
              : index === 6
                ? 'Recovery branch activated following fail-secure transition.'
                : 'Quarantined branch failed continuity validation.',
      successorState:
        index < 4
          ? 'Next verified epoch'
          : index === 4
            ? 'Contested but accepted locally'
            : index === 5
              ? 'No successor'
              : index === 6
                ? 'Safe-return authority restored'
                : 'Unsafe state suppressed',
      x: 8 + index * 12,
      y: 28 + (index % 2) * 18 + (index > 4 ? 8 : 0),
      ...(index > 0 ? { parentId: `epoch-${100 + index}` } : {}),
    });
  });
  return branches;
}

export function buildGuardrails() {
  return [
    { label: 'Active geofence', state: 'retained' as const, detail: 'Geofence envelope retained across all fail-secure branches.' },
    { label: 'No-go zones', state: 'locked' as const, detail: 'Airspace and corridor exclusions cannot be rewritten by hostile commands.' },
    { label: 'Mission rules', state: 'active' as const, detail: 'Command execution must remain authenticated, bounded, and replay-safe.' },
    { label: 'Safe-return policy', state: 'retained' as const, detail: 'Fallback behavior returns to last verified guardrails when authority degrades.' },
    { label: 'Operator authority token', state: 'locked' as const, detail: 'Only authenticated, current authority can change mission state.' },
  ];
}

export function buildAttackEvents(seed: number): AttackEvent[] {
  const rand = mulberry32(seed);
  const base = [
    'AI-generated spoof cluster detected',
    'Guardrail rewrite attempt rejected',
    'Lineage branch divergence contained',
    'Corrupted burst reconstructed',
    'Epoch accepted',
    'Authority rollback denied',
    'Fail-secure state entered',
    'Recovery lineage activated',
    'Reorder pressure absorbed by verified state',
    'Hostile command sequence quarantined',
  ];
  return range(18).map((index) => ({
    id: `evt-${index}`,
    time: `T+${String(index * 12).padStart(3, '0')}s`,
    severity: (['low', 'medium', 'high', 'critical'] as const)[Math.floor((index + rand() * 3) % 4)]!,
    source: ['relay', 'ground-control', 'adversary-forge', 'edge-sensor'][Math.floor(rand() * 4)]!,
    message: base[index % base.length]!,
    trustImpact: Math.round((rand() * 16 - 8) * 10) / 10,
  }));
}

export function buildCommandAttempts(seed: number): CommandAttempt[] {
  const rand = mulberry32(seed);
  return range(5).map((index) => ({
    id: `cmd-${index}`,
    label: ['Route update', 'Geo pin', 'Hold position', 'Return-to-base', 'Authority renew'][index]!,
    status: index % 2 === 0 ? 'accepted' : rand() > 0.4 ? 'rejected' : 'pending',
    auth: Math.round(78 + rand() * 18 - index * 5),
    guardrail: Math.round(84 + rand() * 10 - index * 4),
  }));
}

export function phasePressure(phase: ExercisePhase) {
  const map: Record<ExercisePhase, number> = {
    nominal: 12,
    'light-interference': 26,
    'spoofing-onset': 48,
    'mixed-attack': 74,
    'fail-secure': 86,
    recovery: 40,
  };
  return map[phase];
}

export function buildTimeSeries(seed: number, attackPressure: number, phase: ExercisePhase) {
  const rand = mulberry32(seed);
  const base = phasePressure(phase);
  return range(24).map((step) => {
    const trend = step / 23;
    const spike = attackPressure / 100;
    const phaseLift =
      phase === 'nominal'
        ? 0
        : phase === 'light-interference'
          ? 0.15
          : phase === 'spoofing-onset'
            ? 0.3
            : phase === 'mixed-attack'
              ? 0.5
              : phase === 'fail-secure'
                ? 0.4
                : 0.22;
    return {
      tick: `T-${23 - step}`,
      jamming: clamp(base + trend * 20 + spike * 36 + rand() * 5, 4, 98),
      corruption: clamp(base * 0.72 + trend * 14 + spike * 42 + rand() * 4, 3, 96),
      spoof: clamp(base * 0.64 + phaseLift * 45 + rand() * 6, 2, 95),
      reorder: clamp(base * 0.46 + trend * 18 + spike * 24 + rand() * 5, 3, 84),
      recovery: clamp(100 - base * 0.72 + phaseLift * 20 - trend * 7 + rand() * 4, 8, 98),
    };
  });
}
