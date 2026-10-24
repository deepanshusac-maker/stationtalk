import { NextResponse } from 'next/server';

/**
 * POST /api/promote
 *
 * SEC-02 FIX: Deprecated and deactivated.
 * StationTalk operates on Open-Mic architecture where tokens are issued
 * with direct microphone publishing capability. Arbitrary remote demotion/promotion
 * has been permanently disabled to prevent unauthorized silencing of speakers.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint deactivated. StationTalk operates on decentralized open-mic architecture.',
    },
    { status: 410 }
  );
}
