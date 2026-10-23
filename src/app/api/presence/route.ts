import { NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { getValidSlugs } from '@/lib/stations';

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * GET /api/presence
 *
 * Fetches real-time room occupancy and active participants from LiveKit Cloud SFU.
 * Returns:
 * - counts: map of stationSlug -> real participant count
 * - participants: map of stationSlug -> real participant names
 * - total: real total active participants across all rooms
 */
export async function GET(request: Request) {
  // Accessing request ensures Next.js treats this handler as dynamic per-request
  void request.url;
  try {
    const rawUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!rawUrl) {
      return NextResponse.json({ counts: {}, participants: {}, total: 0 }, { status: 200 });
    }

    const httpUrl = rawUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
    const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    const rooms = await svc.listRooms();

    const validSlugs = new Set(getValidSlugs());
    const counts: Record<string, number> = {};
    const participants: Record<string, string[]> = {};
    let total = 0;

    for (const room of rooms) {
      if (validSlugs.has(room.name) && room.numParticipants > 0) {
        counts[room.name] = room.numParticipants;
        total += room.numParticipants;

        try {
          const roomParts = await svc.listParticipants(room.name);
          participants[room.name] = roomParts
            .map((p) => p.name || 'Traveller')
            .filter(Boolean);
        } catch {
          participants[room.name] = [];
        }
      }
    }

    return NextResponse.json(
      { counts, participants, total },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch room presence from LiveKit:', (error as Error).message);
    return NextResponse.json({ counts: {}, participants: {}, total: 0 }, { status: 200 });
  }
}
