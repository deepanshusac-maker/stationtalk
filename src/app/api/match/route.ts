import { NextRequest, NextResponse } from 'next/server';
import {
  joinOrFindMatch,
  pollMatchStatus,
  skipCurrentMatch,
  leaveQueueOrMatch,
  type Gender,
  type TargetGender,
} from '@/lib/matchmaker';
import { isSubscriptionActive } from '@/lib/razorpay';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const action = body.action as string;
  const peerId = (body.peerId as string)?.trim();

  if (!peerId || typeof peerId !== 'string' || peerId.length < 5 || peerId.length > 100) {
    return NextResponse.json({ error: 'Invalid or missing peerId.' }, { status: 400 });
  }

  // Key rate limiting by IP + peerId so multiple test tabs or users on the same WiFi
  // never block or throttle each other.
  const rateLimitKey = `${ip}:${peerId}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 120, // 120 requests per minute per peer
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
        },
      }
    );
  }

  if (action === 'poll') {
    const result = pollMatchStatus(peerId);
    return NextResponse.json(result);
  }

  if (action === 'leave') {
    leaveQueueOrMatch(peerId);
    return NextResponse.json({ status: 'left' });
  }

  // Validate user fields for join and skip
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : 'Anonymous';
  const gender: Gender = body.gender === 'female' ? 'female' : 'male';

  // SEC-01 FIX: Server-side validation of premium status.
  // Never trust client-supplied body.isPremium.
  const isActuallyPremium = await isSubscriptionActive(peerId);
  const targetGender: TargetGender =
    body.targetGender === 'female' && isActuallyPremium ? 'female' : 'any';

  if (action === 'join') {
    const result = await joinOrFindMatch({
      peerId,
      displayName: displayName.slice(0, 50),
      gender,
      isPremium: isActuallyPremium,
      targetGender,
    });
    return NextResponse.json(result);
  }

  if (action === 'skip') {
    const result = await skipCurrentMatch(peerId, {
      displayName: displayName.slice(0, 50),
      gender,
      isPremium: isActuallyPremium,
      targetGender,
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}
