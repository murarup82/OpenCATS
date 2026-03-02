import type { UIModeBootstrap } from '../types';
import type { ModernRouteResolutionType } from './routeRegistry';

const TELEMETRY_KEY = 'opencats:modern:route-resolution-counters:v1';

type RouteResolutionCounters = {
  native: number;
  bridge: number;
  legacy: number;
  lastUpdatedUTC: string;
  lastRouteKey: string;
  lastRequestURI: string;
};

const DEFAULT_COUNTERS: RouteResolutionCounters = {
  native: 0,
  bridge: 0,
  legacy: 0,
  lastUpdatedUTC: '',
  lastRouteKey: '',
  lastRequestURI: ''
};

function readCounters(): RouteResolutionCounters {
  try {
    const raw = window.sessionStorage.getItem(TELEMETRY_KEY);
    if (!raw) {
      return { ...DEFAULT_COUNTERS };
    }
    const parsed = JSON.parse(raw) as Partial<RouteResolutionCounters>;
    return {
      native: Number(parsed.native || 0),
      bridge: Number(parsed.bridge || 0),
      legacy: Number(parsed.legacy || 0),
      lastUpdatedUTC: String(parsed.lastUpdatedUTC || ''),
      lastRouteKey: String(parsed.lastRouteKey || ''),
      lastRequestURI: String(parsed.lastRequestURI || '')
    };
  } catch (_error) {
    return { ...DEFAULT_COUNTERS };
  }
}

function writeCounters(counters: RouteResolutionCounters): void {
  try {
    window.sessionStorage.setItem(TELEMETRY_KEY, JSON.stringify(counters));
  } catch (_error) {
    // Ignore storage failures (private mode / blocked storage).
  }
}

export function recordRouteResolutionTelemetry(
  bootstrap: UIModeBootstrap,
  resolutionType: ModernRouteResolutionType,
  matchedRouteKey: string
): void {
  const counters = readCounters();
  const key = resolutionType === 'bridge' ? 'bridge' : resolutionType === 'legacy' ? 'legacy' : 'native';
  counters[key] = Number(counters[key] || 0) + 1;
  counters.lastUpdatedUTC = new Date().toISOString();
  counters.lastRouteKey = matchedRouteKey;
  counters.lastRequestURI = String(bootstrap.requestURI || '');
  writeCounters(counters);

  window.dispatchEvent(
    new CustomEvent('opencats:modern-route:resolution', {
      detail: {
        resolutionType,
        matchedRouteKey,
        counters
      }
    })
  );
}
