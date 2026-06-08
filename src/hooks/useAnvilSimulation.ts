import { useEffect, useReducer } from 'react';
import {
  AttackType,
  EnvironmentId,
  ExercisePhase,
  GuardrailState,
  ScreenId,
  SimulationState,
  TrustState,
} from '../types';
import {
  buildAttackEvents,
  buildCommandAttempts,
  buildGuardrails,
  buildLineageBranches,
  buildMockLinks,
  buildMockNodes,
  buildProtocolMetrics,
  buildTimeSeries,
  phasePressure,
  scenarioForEnvironment,
  phases,
} from '../data/mock';
import { clamp } from '../lib/seed';

type Action =
  | { type: 'set-screen'; screen: ScreenId }
  | { type: 'set-environment'; environment: EnvironmentId }
  | { type: 'toggle-attack'; attack: AttackType }
  | { type: 'set-attack-param'; key: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth'; value: number }
  | { type: 'set-phase'; phase: ExercisePhase }
  | { type: 'tick' }
  | { type: 'run' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'inject-attack' }
  | { type: 'select-detail'; detail?: SimulationState['selectedDetail'] }
  | { type: 'export' };

const attackOrder: AttackType[] = [
  'spoofed-commands',
  'replay-attack',
  'burst-jamming',
  'bit-corruption',
  'reorder-attack',
  'authority-overwrite',
  'lineage-desync',
  'epoch-poisoning',
];

function deriveTrustState(confidence: number, threat: number, phase: ExercisePhase): TrustState {
  if (phase === 'fail-secure') return 'fail-secure';
  if (phase === 'recovery') return confidence > 55 ? 'recovery' : 'contested';
  if (confidence >= 78 && threat < 28) return 'trusted';
  if (confidence >= 54) return 'degraded';
  return 'contested';
}

function deriveGuardrails(trustState: TrustState): GuardrailState {
  if (trustState === 'fail-secure') return 'locked';
  if (trustState === 'recovery') return 'retained';
  if (trustState === 'contested') return 'contested';
  if (trustState === 'degraded') return 'retained';
  return 'retained';
}

function deriveMode(trustState: TrustState): SimulationState['mode'] {
  if (trustState === 'fail-secure') return 'Fail-secure';
  if (trustState === 'recovery') return 'Recovery';
  if (trustState === 'contested' || trustState === 'degraded') return 'Contested';
  return 'Simulated';
}

function nextPhase(phase: ExercisePhase): ExercisePhase {
  const index = phases.indexOf(phase);
  return phases[(index + 1) % phases.length]!;
}

function recompute(state: SimulationState, seed = 77): SimulationState {
  const threatPressure =
    clamp(
      phasePressure(state.phase) +
        state.attackIntensity * 0.42 +
        state.attackPersistence * 0.22 +
        state.attackCoordination * 0.16 +
        state.attackStealth * 0.1 +
        state.attackTypes.length * 2.8,
      0,
      100,
    ) +
    (state.attackTypes.includes('authority-overwrite') ? 10 : 0) +
    (state.attackTypes.includes('epoch-poisoning') ? 8 : 0);

  const confidence = clamp(96 - threatPressure * 0.72 + (state.phase === 'recovery' ? 10 : 0), 8, 98);
  const trustState = deriveTrustState(confidence, threatPressure, state.phase);
  const guardrailLock = deriveGuardrails(trustState);
  const mode = deriveMode(trustState);

  const metrics = {
    verifiedCommandRate: clamp(82 - threatPressure * 0.34 + (trustState === 'trusted' ? 8 : 0), 12, 99),
    rejectedHostileAttempts: clamp(18 + threatPressure * 0.58, 0, 99),
    integrityContinuity: clamp(93 - threatPressure * 0.46 + (state.phase === 'recovery' ? 8 : 0), 10, 99),
    authorityState: trustState,
    guardrailLock,
    lastVerifiedEpoch: `E-${100 + state.timeElapsed / 10}`,
    lineageTick: 1000 + state.timeElapsed * 7,
  };

  const nodes = buildMockNodes(seed + state.timeElapsed).map((node, index) => {
    const adjustment =
      state.attackTypes.includes('lineage-desync') && node.role !== 'adversary'
        ? -12
        : state.attackTypes.includes('spoofed-commands')
          ? index % 2 === 0
            ? -6
            : -2
          : 0;
    return {
      ...node,
      trust: clamp(node.trust + adjustment + (state.phase === 'recovery' ? 4 : 0) - threatPressure * 0.18, 2, 99),
      lineageState:
        trustState === 'fail-secure'
          ? 'quarantined'
          : state.phase === 'recovery'
            ? 'recovered'
            : index === 3 && threatPressure > 45
              ? 'contested'
              : node.lineageState,
    };
  });

  const links = buildMockLinks().map((link) => ({
    ...link,
    intensity: clamp(link.intensity + threatPressure * 0.004 + (state.attackTypes.includes('burst-jamming') ? 0.14 : 0), 0.15, 1),
    contested: link.contested || (threatPressure > 40 && !link.trusted),
    hostile: link.hostile || state.attackTypes.includes('authority-overwrite'),
  }));

  const attackEvents = buildAttackEvents(seed + state.timeElapsed + 11).map((event, index) => {
    const derived = attackOrder[index % attackOrder.length]!;
    const suffix =
      state.attackTypes.includes(derived) ? ' - active attack vector aligned' : trustState === 'fail-secure' ? ' - suppressed by fail-secure policy' : '';
    return {
      ...event,
      message: `${event.message}${suffix}`,
      trustImpact: clamp(event.trustImpact - threatPressure * 0.03, -18, 18),
    };
  });

  const commandAttempts = buildCommandAttempts(seed + state.timeElapsed).map((cmd, index) => ({
    ...cmd,
    status:
      trustState === 'fail-secure' && index % 2 === 1
        ? 'rejected'
        : cmd.status,
    auth: clamp(cmd.auth - threatPressure * 0.22 + (state.phase === 'recovery' ? 6 : 0), 4, 99),
    guardrail: clamp(cmd.guardrail - threatPressure * 0.16 + (trustState === 'trusted' ? 6 : 0), 2, 99),
  }));

  const protocolMetrics = buildProtocolMetrics(seed + 31).map((row) => ({
    ...row,
    usableDelivery: clamp(row.usableDelivery - threatPressure * 0.14 + (row.protocol === 'DQSP / Lineage' ? 9 : 0), 6, 99),
    wrongAcceptance: clamp(row.wrongAcceptance + threatPressure * 0.09 - (row.protocol === 'DQSP / Lineage' ? 4 : 0), 0, 33),
    failSecureTransitions: clamp(row.failSecureTransitions + (trustState === 'fail-secure' ? 8 : 0), 0, 48),
    recoveryTime: clamp(row.recoveryTime + (state.phase === 'recovery' ? -5 : threatPressure * 0.03), 2, 36),
  }));

  const lineageBranches = buildLineageBranches(seed + 19).map((branch, index) => ({
    ...branch,
    trust: clamp(branch.trust - threatPressure * 0.22 + (branch.status === 'recovery' ? 10 : 0), 0, 99),
    status:
      trustState === 'fail-secure'
        ? branch.status === 'recovery'
          ? 'recovery'
          : branch.status === 'verified'
            ? 'verified'
            : branch.status === 'quarantined'
              ? 'quarantined'
              : index > 4
                ? 'rejected'
                : branch.status
        : branch.status,
  }));

  const scenario = scenarioForEnvironment(state.environment);
  const series = buildTimeSeries(seed + state.timeElapsed, threatPressure + state.attackIntensity * 0.34, state.phase);
  const headline =
    trustState === 'fail-secure'
      ? 'Fail-secure engaged'
      : trustState === 'trusted'
        ? 'Trusted authority maintained'
        : 'Authority degraded';
  return {
    ...state,
    scenario,
    threatPressure,
    confidence,
    trustState,
    mode,
    metrics,
    nodes,
    links,
    attackEvents,
    commandAttempts,
    protocolMetrics,
    lineageBranches,
    guardrails: buildGuardrails(),
    series,
    headline,
  };
}

function initialState(): SimulationState {
  const scenario = scenarioForEnvironment('mesh-relay');
  const base: SimulationState = {
    scenario,
    phase: 'nominal',
    environment: 'mesh-relay',
    threatPressure: 12,
    trustState: 'trusted',
    attackTypes: ['spoofed-commands', 'burst-jamming'],
    attackIntensity: 48,
    attackPersistence: 40,
    attackCoordination: 52,
    attackStealth: 34,
    isRunning: false,
    timeElapsed: 0,
    confidence: 92,
    mode: 'Simulated',
    metrics: {
      verifiedCommandRate: 86,
      rejectedHostileAttempts: 14,
      integrityContinuity: 91,
      authorityState: 'trusted',
      guardrailLock: 'retained',
      lastVerifiedEpoch: 'E-101',
      lineageTick: 1000,
    },
    nodes: buildMockNodes(77),
    links: buildMockLinks(),
    attackEvents: buildAttackEvents(77),
    commandAttempts: buildCommandAttempts(77),
    protocolMetrics: buildProtocolMetrics(77),
    lineageBranches: buildLineageBranches(77),
    guardrails: buildGuardrails(),
    series: buildTimeSeries(77, 12, 'nominal'),
    headline: 'Trusted authority maintained',
    exportStatus: 'idle',
  };
  return recompute(base, 77);
}

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'set-screen':
      return state;
    case 'set-environment':
      return recompute({
        ...state,
        environment: action.environment,
        scenario: scenarioForEnvironment(action.environment),
      }, 77 + action.environment.length);
    case 'toggle-attack': {
      const next = state.attackTypes.includes(action.attack)
        ? state.attackTypes.filter((item) => item !== action.attack)
        : [...state.attackTypes, action.attack];
      return recompute({ ...state, attackTypes: next }, 101);
    }
    case 'set-attack-param':
      return recompute({ ...state, [action.key]: action.value } as SimulationState, 113);
    case 'set-phase':
      return recompute({ ...state, phase: action.phase }, 131);
    case 'tick':
      return recompute(
        {
          ...state,
          timeElapsed: state.timeElapsed + 1,
          phase: state.isRunning && state.timeElapsed > 0 ? nextPhase(state.phase) : state.phase,
        },
        173 + state.timeElapsed,
      );
    case 'run':
      return { ...state, isRunning: true };
    case 'pause':
      return { ...state, isRunning: false };
    case 'reset':
      return initialState();
    case 'inject-attack':
      return recompute(
        {
          ...state,
          attackIntensity: clamp(state.attackIntensity + 6, 0, 100),
          attackPersistence: clamp(state.attackPersistence + 4, 0, 100),
          attackCoordination: clamp(state.attackCoordination + 5, 0, 100),
          phase: state.phase === 'nominal' ? 'light-interference' : state.phase,
        },
        211 + state.timeElapsed,
      );
    case 'select-detail':
      return action.detail
        ? { ...state, selectedDetail: action.detail }
        : (() => {
            const { selectedDetail, ...rest } = state;
            return rest as SimulationState;
          })();
    case 'export':
      return { ...state, exportStatus: 'success' };
    default:
      return state;
  }
}

export function useAnvilSimulation() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    if (!state.isRunning) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1800);
    return () => window.clearInterval(id);
  }, [state.isRunning]);

  useEffect(() => {
    if (state.exportStatus !== 'success') return;
    const timer = window.setTimeout(() => dispatch({ type: 'select-detail', detail: state.selectedDetail }), 1100);
    return () => window.clearTimeout(timer);
  }, [state.exportStatus, state.selectedDetail]);

  return { state, dispatch };
}
