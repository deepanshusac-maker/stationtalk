import { NextRequest, NextResponse } from 'next/server';
import { normalizeSlug, getStation } from '@/lib/stations';
import { generateParticipantIdentity } from '@/lib/identity';
import { createToken, getLiveKitUrl } from '@/lib/livekit';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/token
 *
 * Issues a short-lived LiveKit access token for a validated station room.
 *
 * Request body: { stationSlug: string, displayName: string }
 * Response: { token: string, url: string, identity: string }
 *
 * Rate limit: 10 requests per minute per IP (in-memory, dev-only).
 */
export async function POST(request: NextRequest) {
  // --- Rate limiting ---
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const rateLimitResult = checkRateLimit(ip, {
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
        },
      }
    );
  }

  // --- Parse and validate request body ---
  let body: { stationSlug?: string; displayName?: string; asSpeaker?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const { stationSlug, displayName, asSpeaker } = body;

  if (!stationSlug || typeof stationSlug !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid stationSlug.' },
      { status: 400 }
    );
  }

  if (!displayName || typeof displayName !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid displayName.' },
      { status: 400 }
    );
  }

  const trimmedName = displayName.trim();
  if (trimmedName.length < 1 || trimmedName.length > 50) {
    return NextResponse.json(
      { error: 'Display name must be 1-50 characters.' },
      { status: 400 }
    );
  }

  // --- Validate station slug ---
  const normalizedSlug = normalizeSlug(stationSlug);
  if (!normalizedSlug) {
    return NextResponse.json(
      { error: 'Invalid or unregistered station.' },
      { status: 404 }
    );
  }

  const station = getStation(normalizedSlug);
  if (!station) {
    return NextResponse.json(
      { error: 'Station not found.' },
      { status: 404 }
    );
  }

  // --- Generate identity and token ---
  const identity = generateParticipantIdentity();

  try {
    const token = await createToken({
      roomName: normalizedSlug,
      participantIdentity: identity,
      participantName: trimmedName,
      canPublish: asSpeaker === true, // Default: listener-only, or speaker if requested
    });

    const url = getLiveKitUrl();

    return NextResponse.json(
      { token, url, identity },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Failed to create LiveKit token:', (error as Error).message);
    return NextResponse.json(
      { error: 'Failed to generate access token.' },
      { status: 500 }
    );
  }
}
