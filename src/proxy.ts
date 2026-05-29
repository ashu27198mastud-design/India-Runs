import { NextRequest, NextResponse } from 'next/server';
import { logger } from './utils/logger';

/**
 * Proxy (Next.js 16 — formerly "middleware") — NIST PR.AA-03 / A01 mitigation.
 * Rate-limits /api/rank to 10 requests per IP per 60-second window.
 * In-memory store is suitable for single-instance Cloud Run deployment.
 */

const RATE_LIMIT = 10;        // max requests per window
const WINDOW_MS = 60 * 1000; // 60 seconds

const ipStore = new Map<string, { count: number; windowStart: number }>();

function getRateLimitResult(ip: string): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    ipStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetInMs: WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetInMs: WINDOW_MS - (now - record.windowStart) };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetInMs: WINDOW_MS - (now - record.windowStart) };
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/rank')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';

    const result = getRateLimitResult(ip);

    const headers = new Headers({
      'X-RateLimit-Limit': String(RATE_LIMIT),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetInMs / 1000)),
    });

    if (!result.allowed) {
      logger.warn('proxy', 'Rate limit exceeded', { ip, path: request.nextUrl.pathname });
      return NextResponse.json(
        { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(result.resetInMs / 1000)}s.` },
        { status: 429, headers }
      );
    }

    const response = NextResponse.next();
    headers.forEach((v, k) => response.headers.set(k, v));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
