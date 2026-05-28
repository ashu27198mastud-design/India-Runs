import { NextResponse } from 'next/server';
import { rankCandidates } from '@/engine/ranking';

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function GET() {
  try {
    const rankedCandidates = await rankCandidates();
    return NextResponse.json({ success: true, data: rankedCandidates });
  } catch (error: any) {
    console.error('Error in ranking API:', error?.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to rank candidates' },
      { status: 500 }
    );
  }
}
