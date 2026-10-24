/**
 * Server-side LiveKit token generation.
 *
 * This module MUST only be imported in server contexts
 * (API routes, Server Components). It accesses env secrets.
 *
 * NEVER log tokens or secrets.
 * NEVER expose LIVEKIT_API_SECRET to the client.
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
  /** Validated room name (normalized station slug). */
  roomName: string;
  /** Unique participant identity (generated server-side). */
  participantIdentity: string;
  /** Sanitized display name shown in the room. */
  participantName: string;
}

/**
 * Create a short-lived LiveKit access token.
 *
 * Default permissions: canSubscribe=true, canPublish=false (strictly listener-only).
 * Token TTL: 1 hour (short-lived).
 */
export async function createListenerToken(options: TokenOptions): Promise<string> {
  const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
  const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.participantIdentity,
    name: options.participantName,
    ttl: '15m', // 15-minute maximum session token TTL
  });

  // Strictly listener-only grants
  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: false,
    canSubscribe: true,
    canPublishData: false,
  });

  return await token.toJwt();
}

/**
 * Get the LiveKit WebSocket URL for the client.
 */
export function getLiveKitUrl(): string {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!url) {
    throw new Error('Missing required environment variable: LIVEKIT_URL or NEXT_PUBLIC_LIVEKIT_URL');
  }
  return url;
}
