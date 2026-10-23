import { NextRequest, NextResponse } from 'next/server';
import { normalizeSlug, getStation } from '@/lib/stations';
import { generateParticipantIdentity } from '@/lib/identity';
import { createListenerToken, getLiveKitUrl } from '@/lib/livekit';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/token
 *
 * Issues a short-lived LiveKit access token for a validated station room.
 *
 * Enforces:
 * 1. Fixed set of pre-registered normalized station slugs (rejection of arbitrary rooms).
 * 2. Strict input validation and sanitization.
 * 3. Unique server-generated participant identity.
 * 4. Strictly listener-only default grants (canPublish: false, canSubscribe: true).
 * 5. Short-lived 1-hour token TTL.
 * 6. Rate limiting (10 req/min per IP).
 * 7. Zero logging of secrets or JWT tokens.
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
      { error: 'Too many requests. Please wait a minute before requesting another token.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
        },
      }
    );
  }

  // --- Parse and validate JSON body ---
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid or malformed JSON payload.' },
      { status: 400 }
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const { stationSlug, displayName } = body;

  // Validate stationSlug
  if (typeof stationSlug !== 'string' || !stationSlug.trim()) {
    return NextResponse.json(
      { error: 'Missing or invalid stationSlug parameter.' },
      { status: 400 }
    );
  }

  // Validate against pre-registered station registry
  const normalizedSlug = normalizeSlug(stationSlug);
  if (!normalizedSlug) {
    return NextResponse.json(
      { error: 'Station room does not exist in the official transit registry.' },
      { status: 404 }
    );
  }

  const station = getStation(normalizedSlug);
  if (!station) {
    return NextResponse.json(
      { error: 'Station platform not found.' },
      { status: 404 }
    );
  }

  // Validate displayName
  if (typeof displayName !== 'string') {
    return NextResponse.json(
      { error: 'Display name must be a string.' },
      { status: 400 }
    );
  }

  const sanitizedName = displayName.trim().replace(/[\x00-\x1F\x7F]/g, '');
  if (sanitizedName.length < 1 || sanitizedName.length > 50) {
    return NextResponse.json(
      { error: 'Display name must be between 1 and 50 characters.' },
      { status: 400 }
    );
  }

  // --- Generate server-side identity & strictly listener token ---
  // Default grants: canPublish = false, canSubscribe = true
  const identity = generateParticipantIdentity();

  try {
    const token = await createListenerToken({
      roomName: normalizedSlug,
      participantIdentity: identity,
      participantName: sanitizedName,
    });

    const url = getLiveKitUrl();

    return NextResponse.json(
      {
        token,
        url,
        identity,
        roomName: normalizedSlug,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error('LiveKit token generation failed:', (error as Error).message);
    return NextResponse.json(
      { error: 'Failed to issue room access token.' },
      { status: 500 }
    );
  }
}
