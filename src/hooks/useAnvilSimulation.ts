import { useEffect, useRef, useReducer, type Dispatch } from 'react';
import { parsePersistedState, persistState, reducer, createInitialState, type SessionAction } from '../lib/session-engine';
import type { SimulationState } from '../types';

const STORAGE_KEY = 'anvil.console.session.v2';

function loadInitialState(): SimulationState {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const restored = parsePersistedState(window.localStorage.getItem(STORAGE_KEY));
    return restored ?? createInitialState();
  } catch {
    return createInitialState();
  }
}

export function useAnvilSimulation() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, persistState(state));
    } catch {
      // Persistence is best-effort only.
    }
  }, [state]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    if (state.screen !== 'live') {
      dispatch({ type: 'set-screen', screen: 'live' });
    }

    if (!state.isRunning) {
      dispatch({ type: 'start-session' });
      dispatch({ type: 'connect' });
    }
  }, [dispatch, state.isRunning, state.screen]);

  useEffect(() => {
    if (!state.isRunning || state.reviewMode || state.exportStatus === 'success') return;

    const interval = window.setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [dispatch, state.exportStatus, state.isRunning, state.reviewMode]);

  return {
    state,
    dispatch: dispatch as Dispatch<SessionAction>,
  };
}
