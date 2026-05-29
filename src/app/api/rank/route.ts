import { NextResponse } from 'next/server';
import { rankCandidates, generateRoleBlueprint } from '@/engine/ranking';
import { logger } from '../../../utils/logger';

export const maxDuration = 300; // 5 minutes max for Cloud Run

export async function GET() {
  try {
    logger.info('api/rank', 'Analysis request received');

    // Run blueprint and ranking in parallel for speed
    const [blueprint, rankedCandidates] = await Promise.all([
      generateRoleBlueprint(),
      rankCandidates(),
    ]);

    logger.info('api/rank', 'Analysis complete', { candidateCount: rankedCandidates.length });

    return NextResponse.json({
      success: true,
      data: rankedCandidates,
      blueprint,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    logger.error('api/rank', 'Analysis failed', { error: message });
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
