/**
 * Server-side LiveKit token generation.
 *
 * This module MUST only be imported in server contexts
 * (API routes, Server Components). It accesses env secrets.
 *
 * NEVER log tokens or secrets.
 */

import { AccessToken } from 'livekit-server-sdk';

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export interface TokenOptions {
  /** Validated room name (station slug). */
  roomName: string;
  /** Unique participant identity. */
  participantIdentity: string;
  /** Display name shown in the room. */
  participantName: string;
  /** Whether the participant can publish audio. Default: false (listener). */
  canPublish?: boolean;
}

/**
 * Create a short-lived LiveKit access token.
 *
 * Default permissions: canSubscribe=true, canPublish=false (listener-only).
 * Token TTL: 4 hours.
 */
export async function createToken(options: TokenOptions): Promise<string> {
  const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
  const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.participantIdentity,
    name: options.participantName,
    ttl: '4h',
  });

  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: options.canPublish ?? false,
    canSubscribe: true,
    canPublishData: false,
  });

  return await token.toJwt();
}

/**
 * Get the LiveKit WebSocket URL for the client.
 */
export function getLiveKitUrl(): string {
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;
  if (!url) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_LIVEKIT_URL or LIVEKIT_URL');
  }
  return url;
}
