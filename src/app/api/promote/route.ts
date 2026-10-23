import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { normalizeSlug } from '@/lib/stations';
import { isValidIdentity } from '@/lib/identity';

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
 * Promotes or demotes a participant to/from speaker role via LiveKit Server SDK.
 * Request body: { roomName: string, identity: string, canPublish: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    let body: { roomName?: string; identity?: string; canPublish?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { roomName, identity, canPublish } = body;

    if (!roomName || typeof roomName !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid roomName' }, { status: 400 });
    }

    const normalizedSlug = normalizeSlug(roomName);
    if (!normalizedSlug) {
      return NextResponse.json({ error: 'Invalid room name' }, { status: 404 });
    }

    if (!identity || typeof identity !== 'string' || !isValidIdentity(identity)) {
      return NextResponse.json({ error: 'Invalid participant identity' }, { status: 400 });
    }

    const rawUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!rawUrl) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const httpUrl = rawUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
    const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    const publishPermission = Boolean(canPublish);

    await svc.updateParticipant(normalizedSlug, identity, undefined, {
      canPublish: publishPermission,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json(
      { success: true, canPublish: publishPermission },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update participant permissions:', (error as Error).message);
    return NextResponse.json(
      { error: 'Failed to update participant permissions' },
      { status: 500 }
    );
  }
}
