import { NextResponse } from 'next/server';
import { rankCandidates, generateRoleBlueprint } from '@/engine/ranking';

export const maxDuration = 300; // 5 minutes max for Cloud Run

export async function GET() {
  try {
    // Run blueprint and ranking in parallel for speed
    const [blueprint, rankedCandidates] = await Promise.all([
      generateRoleBlueprint(),
      rankCandidates()
    ]);

    return NextResponse.json({ 
      success: true, 
      data: rankedCandidates,
      blueprint: blueprint
    });
  } catch (error: any) {
    console.error('[API/rank] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
