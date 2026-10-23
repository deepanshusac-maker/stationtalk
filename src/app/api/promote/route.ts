import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { normalizeSlug } from '@/lib/stations';
import { isValidIdentity } from '@/lib/identity';

const MAX_SPEAKERS_PER_ROOM = 7;

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * POST /api/promote
 *
 * Server-side promotion and demotion authority.
 *
 * Security & Constraints:
 * 1. Validates normalized station room ID (rejects arbitrary rooms).
 * 2. Validates server-generated participant identity format.
 * 3. Enforces a strict server-side 7-speaker cap against concurrent room state.
 * 4. Updates participant grants directly via LiveKit Server SDK RoomServiceClient.
 */
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { roomName, identity, canPublish } = body;

    // Validate roomName
    if (typeof roomName !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid roomName.' }, { status: 400 });
    }

    const normalizedSlug = normalizeSlug(roomName);
    if (!normalizedSlug) {
      return NextResponse.json(
        { error: 'Station room not recognized in transit registry.' },
        { status: 404 }
      );
    }

    // Validate identity format (user-<uuid>)
    if (typeof identity !== 'string' || !isValidIdentity(identity)) {
      return NextResponse.json(
        { error: 'Invalid or forged participant identity.' },
        { status: 400 }
      );
    }

    const rawUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!rawUrl) {
      return NextResponse.json({ error: 'LiveKit server configuration missing.' }, { status: 500 });
    }

    const httpUrl = rawUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
    const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    const willPublish = Boolean(canPublish);

    // Enforce 7-speaker cap when promoting to speaker
    if (willPublish) {
      try {
        const participants = await svc.listParticipants(normalizedSlug);
        const currentSpeakers = participants.filter((p) => p.permission?.canPublish);

        // Check if user is already one of the active speakers
        const isAlreadySpeaker = currentSpeakers.some((p) => p.identity === identity);

        if (!isAlreadySpeaker && currentSpeakers.length >= MAX_SPEAKERS_PER_ROOM) {
          return NextResponse.json(
            {
              error: `Station stage is full. Maximum ${MAX_SPEAKERS_PER_ROOM} speakers allowed concurrently.`,
              maxSpeakers: MAX_SPEAKERS_PER_ROOM,
              activeSpeakers: currentSpeakers.length,
            },
            { status: 409 }
          );
        }
      } catch (listErr) {
        // If room is empty or doesn't exist yet on LiveKit, proceed with promotion
        console.warn('Could not inspect room participants before promotion:', (listErr as Error).message);
      }
    }

    // Perform server-side update of participant permissions
    await svc.updateParticipant(normalizedSlug, identity, undefined, {
      canPublish: willPublish,
      canSubscribe: true,
      canPublishData: willPublish,
    });

    return NextResponse.json(
      {
        success: true,
        canPublish: willPublish,
        room: normalizedSlug,
        identity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Participant promotion failed:', (error as Error).message);
    return NextResponse.json(
      { error: 'Failed to update participant permissions on LiveKit SFU.' },
      { status: 500 }
    );
  }
}
