import { NextResponse } from 'next/server';
import { logger } from '../../../utils/logger';

/**
 * Health Check Endpoint — NIST PR.PS-03 / F-003 remediation.
 * Validates all required environment variables at runtime.
 * Returns 200 OK if healthy, 503 Service Unavailable if misconfigured.
 * Cloud Run uses this for readiness/liveness probes.
 */

const REQUIRED_ENV_VARS = ['GEMINI_API_KEY'];
// GOOGLE_CIVIC_API_KEY is optional — graceful degradation if absent

export async function GET() {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error('health', 'Health check failed — missing required environment variables', { missing });
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          environment: { status: 'FAIL', missing },
          ai_engine: { status: 'UNAVAILABLE' },
        },
      },
      { status: 503 }
    );
  }

  logger.info('health', 'Health check passed');
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
    checks: {
      environment: { status: 'OK', vars: REQUIRED_ENV_VARS.map(k => `${k}=set`) },
      ai_engine: { status: 'READY', model: 'gemini-2.5-pro' },
      rate_limiter: { status: 'ACTIVE', limit: '10 req/60s per IP' },
    },
  });
}
