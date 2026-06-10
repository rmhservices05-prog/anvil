import {
  AttackType,
  ConnectionState,
  ConsoleAlert,
  EnvironmentId,
  EvidenceItem,
  ExercisePhase,
  ExportPayload,
  PanelLayoutState,
  MissionBrief,
  ProtocolName,
  Scenario,
  ScreenId,
  SessionEventType,
  SessionPhase,
  SessionTimelineEntry,
  SelectedDetail,
  SimulationState,
  TrustState,
  WorkspaceState,
  WorkflowStep,
} from '../types';
import {
  buildAttackEvents,
  buildCommandAttempts,
  buildConnectionLifecycle,
  buildConsoleAlerts,
  buildEvidenceItems,
  buildGuardrails,
  buildLineageBranches,
  buildMockLinks,
  buildMockNodes,
  buildProtocolMetrics,
  buildSessionTimeline,
  buildTimeSeries,
  deriveConnectionState,
  deriveEvidenceCategory,
  deriveSessionPhase,
  deriveTrustStateFromSession,
  exportSummaryText,
  phasePressure,
  scenarioForEnvironment,
  scenarios,
} from '../data/mock';
import { clamp, formatPercent } from './seed';

export type SessionFilterState = PanelLayoutState['filters'];

export interface SessionAction {
  type:
    | 'start-session'
    | 'connect'
    | 'pause'
    | 'resume'
    | 'step'
    | 'reset'
    | 'run'
    | 'set-screen'
    | 'set-phase'
    | 'set-scenario'
    | 'toggle-attack'
    | 'set-attack-param'
    | 'select-node'
    | 'select-branch'
    | 'select-event'
    | 'select-evidence'
    | 'select-detail'
    | 'acknowledge-alert'
    | 'filter-protocol'
    | 'export'
    | 'export-evidence'
    | 'toggle-sidebar'
    | 'set-panel-layout'
    | 'set-review-mode'
    | 'inject-attack'
    | 'tick';
  screen?: ScreenId;
  scenarioId?: string;
  attack?: AttackType;
  key?: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth';
  value?: number;
  phase?: ExercisePhase;
  id?: string;
  layout?: Partial<PanelLayoutState>;
  protocol?: ProtocolName;
  detail?: SelectedDetail;
  on?: boolean;
  reviewMode?: boolean;
}

const persistenceKey = 'anvil.console.session.v2';
const activeScreenOrder: ScreenId[] = ['overview', 'live', 'attack', 'lineage', 'guardrails', 'analysis', 'evidence'];
const screenMeta: Record<ScreenId, { label: string; detail: string }> = {
  overview: { label: 'Overview', detail: 'Mission health, authority continuity, and trend summary.' },
  live: { label: 'Live exercise', detail: 'Phase control, attack injection, and reactive telemetry.' },
  attack: { label: 'Attack forge', detail: 'Composable adversary recipes and pressure shaping.' },
  lineage: { label: 'Lineage inspection', detail: 'Epoch continuity, rejection, and recovery branches.' },
  guardrails: { label: 'Guardrails', detail: 'Fail-secure mission rules and retained policy state.' },
  analysis: { label: 'Protocol analysis', detail: 'Operational protocol comparison under mixed attack.' },
  evidence: { label: 'Evidence export', detail: 'Package the scenario, outcomes, and audit trail.' },
};

export function createInitialState(): SimulationState {
  const scenario = scenarioForEnvironment('ground-air');
  const base: SimulationState = {
    screen: 'overview',
    session: {
      id: 'session-ground-air-001',
      phase: 'idle',
      connection: 'disconnected',
      status: 'idle',
      startedAt: 'T+000s',
      updatedAt: 'T+000s',
      step: 0,
      reviewMode: false,
    },
    connectionState: 'disconnected',
    scenario,
    phase: 'nominal',
    environment: 'ground-air',
    threatPressure: 12,
    trustState: 'trusted',
    attackTypes: [],
    attackIntensity: 18,
    attackPersistence: 12,
    attackCoordination: 14,
    attackStealth: 10,
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
    summary: {
      sessionPhase: 'idle',
      connectionState: 'disconnected',
      alertCount: 0,
      evidenceCount: 0,
      selectedScenarioId: scenario.id,
      changed: ['console booted in idle state'],
    },
    workflow: [],
    alerts: [],
    briefing: [],
    timeline: [],
    consoleAlerts: [],
    evidence: [],
    exportStatus: 'idle',
    workspace: {
      selectedScenarioId: scenario.id,
      savedPreferences: { theme: 'console', density: 'compact' },
      recentSessions: [],
      recentExports: [],
    },
    layout: {
      sidebarCollapsed: false,
      activeScreen: 'overview',
      filters: {},
      dockedPanels: {
        timeline: true,
        alerts: true,
        evidence: true,
      },
    },
    reviewMode: false,
    sessionPhase: 'idle',
    persistenceKey,
  };
  return recomputeState(base, 77, true);
}

export function createExportPayload(state: SimulationState): ExportPayload {
  return {
    version: '1.0.0',
    generatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
    session: {
      id: state.session.id,
      phase: state.session.phase,
      connection: state.session.connection,
      status: state.session.status,
      startedAt: state.session.startedAt,
      updatedAt: state.session.updatedAt,
      reviewMode: state.reviewMode,
    },
    timeline: state.timeline,
    alerts: state.consoleAlerts,
    metrics: state.metrics,
    scenario: state.scenario,
    ...(state.selectedDetail ? { selectedDetail: state.selectedDetail } : {}),
    evidence: state.evidence,
    lineages: state.lineageBranches,
    protocolSummary: state.protocolMetrics,
  };
}

export function summarizeSession(state: SimulationState) {
  return {
    sessionId: state.session.id,
    scenarioId: state.scenario.id,
    updatedAt: state.session.updatedAt,
    sessionPhase: state.session.phase,
    connectionState: state.session.connection,
    headline: state.headline,
    exportCount: state.workspace.recentExports.length,
  };
}

export function hydrateState(raw: unknown): SimulationState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<SimulationState>;
  if (!candidate.scenario || !candidate.session || !candidate.layout || !candidate.workspace) return null;
  return recomputeState(candidate as SimulationState, 77, true);
}

export function persistState(state: SimulationState) {
  return JSON.stringify({
    version: 2,
    state,
    summary: summarizeSession(state),
  });
}

export function parsePersistedState(raw: string | null): SimulationState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: unknown };
    return hydrateState(parsed.state);
  } catch {
    return null;
  }
}

export function reducer(state: SimulationState, action: SessionAction): SimulationState {
  switch (action.type) {
    case 'run':
      return state.session.phase === 'idle' ? reducer(state, { type: 'start-session' }) : reducer(state, { type: 'resume' });
    case 'start-session':
      return recomputeState(
        {
          ...state,
          session: {
            ...state.session,
            phase: 'preparing',
            connection: 'connecting',
            status: 'preparing',
            startedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          connectionState: 'connecting',
          isRunning: true,
          sessionPhase: 'preparing',
        },
        101 + state.timeElapsed,
        false,
        'session.started',
      );
    case 'connect':
      return recomputeState(
        {
          ...state,
          session: {
            ...state.session,
            phase: 'running',
            connection: state.threatPressure > 72 ? 'degraded' : 'connected',
            status: 'running',
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          connectionState: state.threatPressure > 72 ? 'degraded' : 'connected',
          isRunning: true,
          sessionPhase: 'running',
        },
        103 + state.timeElapsed,
        false,
        'session.connected',
      );
    case 'pause':
      return recomputeState(
        {
          ...state,
          session: {
            ...state.session,
            phase: 'degraded',
            status: 'paused',
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          sessionPhase: 'degraded',
          isRunning: false,
          reviewMode: false,
        },
        107 + state.timeElapsed,
        false,
        'session.paused',
      );
    case 'resume':
      return recomputeState(
        {
          ...state,
          session: {
            ...state.session,
            phase: 'running',
            status: 'running',
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          isRunning: true,
          sessionPhase: 'running',
          reviewMode: false,
        },
        109 + state.timeElapsed,
        false,
        'session.resumed',
      );
    case 'step':
      return recomputeState(
        {
          ...state,
          timeElapsed: state.timeElapsed + 1,
          session: {
            ...state.session,
            step: state.session.step + 1,
            updatedAt: `T+${String(state.timeElapsed + 1).padStart(3, '0')}s`,
            phase: state.session.phase === 'review' ? 'review' : state.session.phase,
          },
        },
        113 + state.timeElapsed,
        true,
        'session.stepped',
      );
    case 'reset':
      return createInitialStateWithTimeline('session.reset');
    case 'set-screen':
      if (!action.screen) return state;
      return recomputeState({ ...state, screen: action.screen, layout: { ...state.layout, activeScreen: action.screen } }, 191 + action.screen.length, false, 'layout.changed');
    case 'set-phase':
      if (!action.phase) return state;
      return recomputeState({ ...state, phase: action.phase }, 193 + action.phase.length, false, 'session.stepped');
    case 'set-scenario': {
      const nextScenario = scenarios.find((scenario) => scenario.id === action.scenarioId) ?? scenarioForEnvironment('ground-air');
      return recomputeState(
        {
          ...state,
          scenario: nextScenario,
          workspace: { ...state.workspace, selectedScenarioId: nextScenario.id },
          layout: { ...state.layout, activeScreen: 'overview' },
          screen: 'overview',
        },
        197 + nextScenario.id.length,
        false,
        'scenario.selected',
      );
    }
    case 'toggle-attack': {
      if (!action.attack) return state;
      const next = state.attackTypes.includes(action.attack)
        ? state.attackTypes.filter((item) => item !== action.attack)
        : [...state.attackTypes, action.attack];
      return recomputeState({ ...state, attackTypes: next }, 211 + next.length, false, 'attack.armed');
    }
    case 'set-attack-param':
      if (!action.key || action.value === undefined) return state;
      return recomputeState({ ...state, [action.key]: action.value } as SimulationState, 227 + action.value, false, 'attack.injected');
    case 'select-node':
      if (!action.id) return state;
      return recomputeState({ ...state, selectedDetail: { type: 'node', id: action.id }, layout: { ...state.layout, selectedDetail: { type: 'node', id: action.id } } }, 233 + state.timeElapsed, false, 'node.selected');
    case 'select-branch':
      if (!action.id) return state;
      return recomputeState({ ...state, selectedDetail: { type: 'branch', id: action.id }, layout: { ...state.layout, selectedDetail: { type: 'branch', id: action.id } } }, 239 + state.timeElapsed, false, 'lineage.branch_selected');
    case 'select-event':
      if (!action.id) return state;
      return recomputeState({ ...state, selectedDetail: { type: 'event', id: action.id }, layout: { ...state.layout, selectedDetail: { type: 'event', id: action.id } } }, 241 + state.timeElapsed, false, 'event.selected');
    case 'select-evidence':
      if (!action.id) return state;
      return recomputeState({ ...state, selectedDetail: { type: 'evidence', id: action.id }, layout: { ...state.layout, selectedDetail: { type: 'evidence', id: action.id } } }, 243 + state.timeElapsed, false, 'evidence.selected');
    case 'select-detail':
      if (!action.detail) return state;
      if (action.detail.type === 'node') return reducer(state, { type: 'select-node', id: action.detail.id });
      if (action.detail.type === 'branch') return reducer(state, { type: 'select-branch', id: action.detail.id });
      if (action.detail.type === 'event') return reducer(state, { type: 'select-event', id: action.detail.id });
      return reducer(state, { type: 'select-evidence', id: action.detail.id });
    case 'acknowledge-alert':
      return recomputeState(
        {
          ...state,
          consoleAlerts: state.consoleAlerts.map((alert) => (alert.id === action.id ? { ...alert, acknowledged: true } : alert)),
        },
        247 + state.timeElapsed,
        false,
        'guardrail.recovered',
      );
    case 'filter-protocol':
      return recomputeState(
        {
          ...state,
          layout: {
            ...state.layout,
            filters:
              action.protocol === undefined
                ? (() => {
                    const { protocol, ...rest } = state.layout.filters;
                    return rest;
                  })()
                : { ...state.layout.filters, protocol: action.protocol },
          },
        },
        251 + state.timeElapsed,
        false,
        'protocol.filtered',
      );
    case 'toggle-sidebar':
      return recomputeState(
        {
          ...state,
          layout: { ...state.layout, sidebarCollapsed: !state.layout.sidebarCollapsed },
        },
        253 + state.timeElapsed,
        false,
        'sidebar.toggled',
      );
    case 'set-panel-layout':
      return recomputeState(
        {
          ...state,
          selectedDetail: Object.prototype.hasOwnProperty.call(action.layout ?? {}, 'selectedDetail')
            ? action.layout?.selectedDetail
            : state.selectedDetail,
          layout: { ...state.layout, ...action.layout },
        },
        257 + state.timeElapsed,
        false,
        'layout.changed',
      );
    case 'set-review-mode':
      return recomputeState(
        {
          ...state,
          reviewMode: action.reviewMode ?? !state.reviewMode,
          session: {
            ...state.session,
            phase: action.reviewMode ?? !state.reviewMode ? 'review' : state.session.phase,
            status: action.reviewMode ?? !state.reviewMode ? 'review' : state.session.status,
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          sessionPhase: action.reviewMode ?? !state.reviewMode ? 'review' : state.sessionPhase,
        },
        263 + state.timeElapsed,
        false,
        'session.reviewed',
      );
    case 'export-evidence':
      return recomputeState(
        {
          ...state,
          session: {
            ...state.session,
            phase: 'exporting',
            status: 'exporting',
            updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
          },
          sessionPhase: 'exporting',
          exportStatus: 'success',
        },
        271 + state.timeElapsed,
        false,
        'evidence.exported',
      );
    case 'export':
      return reducer(state, { type: 'export-evidence' });
    case 'inject-attack':
      return recomputeState(
        {
          ...state,
          attackIntensity: clamp(state.attackIntensity + 6, 0, 100),
          attackPersistence: clamp(state.attackPersistence + 4, 0, 100),
          attackCoordination: clamp(state.attackCoordination + 5, 0, 100),
          phase: state.phase === 'nominal' ? 'light-interference' : state.phase,
        },
        281 + state.timeElapsed,
        false,
        'attack.injected',
      );
    case 'tick':
      return recomputeState(
        {
          ...state,
          timeElapsed: state.timeElapsed + 1,
          session: {
            ...state.session,
            step: state.session.step + 1,
            updatedAt: `T+${String(state.timeElapsed + 1).padStart(3, '0')}s`,
          },
        },
        293 + state.timeElapsed,
        true,
        'session.stepped',
      );
    default:
      return state;
  }
}

export function recomputeState(state: SimulationState, seed = 77, preserveTimeline = false, eventType?: SessionEventType): SimulationState {
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
  const trustState = deriveTrustStateFromSession(confidence, threatPressure, state.phase);
  const mode: SimulationState['mode'] =
    state.reviewMode && state.session.phase === 'review'
      ? 'Recovery'
      : trustState === 'fail-secure'
        ? 'Fail-secure'
        : trustState === 'recovery'
          ? 'Recovery'
          : trustState === 'contested' || trustState === 'degraded'
            ? 'Contested'
            : 'Simulated';
  const connectionState: ConnectionState =
    state.session.connection === 'connecting' || state.session.phase === 'preparing'
      ? 'connecting'
      : state.session.connection === 'degraded' || state.threatPressure > 72
        ? 'degraded'
        : state.session.connection === 'lost' || (!state.isRunning && state.timeElapsed > 0 && state.confidence < 30)
          ? 'lost'
          : state.session.connection === 'connected' || state.isRunning
            ? 'connected'
            : deriveConnectionState(state);
  const sessionPhase: SessionPhase =
    state.session.phase !== 'idle'
      ? state.session.phase
      : deriveSessionPhase({
          reviewMode: state.reviewMode,
          isRunning: state.isRunning,
          exportStatus: state.exportStatus,
          timeElapsed: state.timeElapsed,
          confidence,
        });
  const guardrailLock = trustState === 'fail-secure' ? 'locked' : trustState === 'contested' ? 'contested' : trustState === 'recovery' ? 'retained' : 'retained';
  const metrics: SimulationState['metrics'] = {
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
    const suffix =
      state.attackTypes.includes(['spoofed-commands', 'replay-attack', 'burst-jamming', 'bit-corruption', 'reorder-attack', 'authority-overwrite', 'lineage-desync', 'epoch-poisoning'][index % 8] as AttackType)
        ? ' - active attack vector aligned'
        : trustState === 'fail-secure'
          ? ' - suppressed by fail-secure policy'
          : '';
    return {
      ...event,
      message: `${event.message}${suffix}`,
      trustImpact: clamp(event.trustImpact - threatPressure * 0.03, -18, 18),
    };
  });

  const commandAttempts = buildCommandAttempts(seed + state.timeElapsed).map((cmd, index) => ({
    ...cmd,
    status: trustState === 'fail-secure' && index % 2 === 1 ? 'rejected' : cmd.status,
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

  const scenario = scenarios.find((item) => item.id === state.workspace.selectedScenarioId) ?? scenarioForEnvironment(state.environment);
  const series = buildTimeSeries(seed + state.timeElapsed, threatPressure + state.attackIntensity * 0.34, state.phase);
  const timeline = preserveTimeline
    ? [...state.timeline]
    : buildSessionTimeline(seed + state.timeElapsed, {
        timeElapsed: state.timeElapsed,
        phase: state.phase,
        attackTypes: state.attackTypes,
        trustState,
        exportStatus: state.exportStatus,
        ...(state.selectedDetail ? { selectedDetail: state.selectedDetail } : {}),
      });
  const consoleAlerts = buildConsoleAlerts(seed + state.timeElapsed, { threatPressure, confidence, attackTypes: state.attackTypes, trustState, metrics });
  const evidence = buildEvidenceItems(seed + state.timeElapsed, { scenario, metrics, headline: trustState === 'fail-secure' ? 'Fail-secure engaged' : trustState === 'trusted' ? 'Trusted authority maintained' : 'Authority degraded', attackTypes: state.attackTypes, timeline, trustState, phase: state.phase });
  const workflow = buildWorkflow(state.layout.activeScreen, trustState, state.session.phase);
  const briefing: MissionBrief[] = buildBriefing(state, threatPressure, trustState, sessionPhase, connectionState, evidence.length);
  const alertCount = consoleAlerts.filter((alert) => !alert.acknowledged).length;
  const changed = buildChangedSummary(state, trustState, connectionState, sessionPhase);
  const headline =
    trustState === 'fail-secure'
      ? 'Fail-secure engaged'
      : trustState === 'trusted'
        ? 'Trusted authority maintained'
        : state.reviewMode
          ? 'Review mode active'
          : 'Authority degraded';

  const nextState: SimulationState = {
    ...state,
    scenario,
    threatPressure,
    confidence,
    trustState,
    mode,
    connectionState,
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
    workflow,
    alerts: consoleAlerts.map((alert) => ({ id: alert.id, severity: alert.level, title: alert.title, detail: alert.message, driver: alert.timestamp })),
    briefing,
    timeline,
    consoleAlerts,
    evidence,
    sessionPhase,
    summary: {
      sessionPhase,
      connectionState,
      alertCount,
      evidenceCount: evidence.length,
      selectedScenarioId: scenario.id,
      changed,
    },
    session: {
      ...state.session,
      phase: sessionPhase,
      connection: connectionState,
      status: state.exportStatus === 'success' ? 'exporting' : state.reviewMode ? 'review' : state.isRunning ? 'running' : state.session.status,
      updatedAt: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
    },
    layout: {
      ...state.layout,
      activeScreen: state.layout.activeScreen,
      ...(state.layout.selectedDetail ?? state.selectedDetail ? { selectedDetail: state.layout.selectedDetail ?? state.selectedDetail } : {}),
    },
    ...(state.exportStatus === 'success' ? { exportPayload: createExportPayload(state) } : state.exportPayload ? { exportPayload: state.exportPayload } : {}),
    workspace: {
      ...state.workspace,
      selectedScenarioId: scenario.id,
      lastSessionId: state.session.id,
    },
    persistenceKey,
  };

  if (eventType) {
    nextState.timeline = [...timeline, timelineEntry(seed, state, eventType, connectionState, sessionPhase)];
    nextState.summary.changed = [...changed, eventSummary(eventType, state)];
  }

  return nextState;
}

function createInitialStateWithTimeline(eventType: SessionEventType) {
  const initial = createInitialState();
  return recomputeState(initial, 77, false, eventType);
}

function buildWorkflow(screen: ScreenId, trustState: TrustState, sessionPhase: SessionPhase): WorkflowStep[] {
  const activeIndex = activeScreenOrder.indexOf(screen);
  return activeScreenOrder.map((id, index) => {
    const meta = screenMeta[id];
    const status: WorkflowStep['status'] =
      index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'queued';
    return {
      id,
      label: meta.label,
      detail:
        id === 'guardrails' && trustState === 'fail-secure'
          ? 'Mission rules are retained and the console is pinned to fail-secure policy.'
          : id === 'evidence' && sessionPhase === 'review'
            ? 'Review mode is holding the artifact layer open for replay.'
            : meta.detail,
      status,
    };
  });
}

function buildBriefing(
  state: SimulationState,
  threatPressure: number,
  trustState: TrustState,
  sessionPhase: SessionPhase,
  connectionState: ConnectionState,
  evidenceCount: number,
): MissionBrief[] {
  const pressureDelta = Math.round(threatPressure - phasePressure(state.phase));
  const evidenceReadiness = clamp(state.metrics.integrityContinuity + (trustState === 'trusted' ? 8 : trustState === 'recovery' ? 4 : -6), 0, 99);
  return [
    {
      label: 'Session phase',
      value: sessionPhase,
      detail: `Lifecycle is currently ${sessionPhase}.`,
      tone: sessionPhase === 'running' ? 'trust' : sessionPhase === 'degraded' ? 'amber' : 'hostile',
    },
    {
      label: 'Connection',
      value: connectionState,
      detail: `Console link is ${connectionState}.`,
      tone: connectionState === 'connected' ? 'trust' : connectionState === 'connecting' ? 'amber' : 'hostile',
    },
    {
      label: 'Evidence',
      value: `${evidenceCount}`,
      detail:
        evidenceReadiness > 75
          ? 'The current state is ready to export as a clean evidence bundle.'
          : 'The evidence pack is still usable, but more signal can be gathered before export.',
      tone: evidenceReadiness > 75 ? 'trust' : evidenceReadiness > 45 ? 'amber' : 'hostile',
    },
  ];
}

function timelineEntry(seed: number, state: SimulationState, eventType: SessionEventType, connectionState: ConnectionState, sessionPhase: SessionPhase): SessionTimelineEntry {
  return {
    id: `tl-live-${seed}`,
    timestamp: `T+${String(state.timeElapsed).padStart(3, '0')}s`,
    type: eventType,
    title: eventTitle(eventType),
    details: eventDetails(eventType, state, connectionState, sessionPhase),
    severity: eventType.startsWith('guardrail') || eventType.startsWith('session.exporting') ? 'warn' : 'info',
  };
}

function eventTitle(type: SessionEventType) {
  const titles: Record<SessionEventType, string> = {
    'session.started': 'Session started',
    'session.paused': 'Session paused',
    'session.resumed': 'Session resumed',
    'session.reset': 'Session reset',
    'attack.armed': 'Attack armed',
    'attack.injected': 'Attack injected',
    'link.state_changed': 'Link state changed',
    'lineage.branch_selected': 'Branch selected',
    'evidence.exported': 'Evidence exported',
    'guardrail.violated': 'Guardrail violated',
    'guardrail.recovered': 'Guardrail recovered',
    'protocol.filtered': 'Protocol filtered',
    'node.selected': 'Node selected',
    'branch.selected': 'Branch selected',
    'event.selected': 'Event selected',
    'evidence.selected': 'Evidence selected',
    'scenario.selected': 'Scenario selected',
    'sidebar.toggled': 'Sidebar toggled',
    'layout.changed': 'Layout changed',
    'session.connected': 'Session connected',
    'session.degraded': 'Session degraded',
    'session.recovering': 'Session recovering',
    'session.reviewed': 'Review mode enabled',
    'session.stepped': 'Session stepped',
    'session.exporting': 'Evidence export requested',
  };
  return titles[type];
}

function eventDetails(type: SessionEventType, state: SimulationState, connectionState: ConnectionState, sessionPhase: SessionPhase) {
  switch (type) {
    case 'session.started':
      return `Console booted for ${state.scenario.title}.`;
    case 'session.paused':
      return 'Operator paused the live session.';
    case 'session.resumed':
      return 'Operator resumed the live session.';
    case 'session.reset':
      return 'Session returned to the deterministic ground-air baseline.';
    case 'attack.armed':
      return `Active attack profile now has ${state.attackTypes.length} vectors.`;
    case 'attack.injected':
      return `Threat pressure is now ${Math.round(state.threatPressure)}.`;
    case 'link.state_changed':
      return `Connection state is ${connectionState}.`;
    case 'lineage.branch_selected':
      return 'Selected lineage branch has been tracked in the drawer.';
    case 'evidence.exported':
      return 'Evidence bundle generated locally for download.';
    case 'guardrail.violated':
      return 'Guardrail violation registered and retained for review.';
    case 'guardrail.recovered':
      return 'Guardrail recovered or acknowledged by operator.';
    case 'protocol.filtered':
      return `Protocol view filtered by ${state.layout.filters.protocol ?? 'current comparison set'}.`;
    case 'node.selected':
      return 'Node selection linked into the focus drawer.';
    case 'branch.selected':
      return 'Branch selection linked into the focus drawer.';
    case 'event.selected':
      return 'Event selection linked into the focus drawer.';
    case 'evidence.selected':
      return 'Evidence selection linked into the focus drawer.';
    case 'scenario.selected':
      return `Scenario switched to ${state.scenario.title}.`;
    case 'sidebar.toggled':
      return 'Sidebar visibility updated.';
    case 'layout.changed':
      return `Layout synchronized to ${state.layout.activeScreen}.`;
    case 'session.connected':
      return `Session phase is now ${sessionPhase}.`;
    case 'session.degraded':
      return 'Session has entered degraded mode due to hostile pressure.';
    case 'session.recovering':
      return 'Session is recovering after a fail-secure or degraded state.';
    case 'session.reviewed':
      return 'Review mode is active for replay and inspection.';
    case 'session.stepped':
      return 'Deterministic step advanced the session timeline.';
    case 'session.exporting':
      return 'Export pipeline is preparing the session artifact.';
    default:
      return '';
  }
}

function buildChangedSummary(state: SimulationState, trustState: TrustState, connectionState: ConnectionState, sessionPhase: SessionPhase): string[] {
  return [
    `phase=${sessionPhase}`,
    `connection=${connectionState}`,
    `authority=${trustState}`,
    `alerts=${state.consoleAlerts.length}`,
  ];
}

function eventSummary(type: SessionEventType, state: SimulationState) {
  return `${type} @ ${state.session.id}`;
}
