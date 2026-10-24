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
 * Create a short-lived LiveKit access token with open-mic capabilities.
 *
 * Every passenger receives open publishing rights (canPublish: true, canSubscribe: true)
 * so they can speak freely by simply unmuting their microphone with zero role hierarchy.
 * Token TTL: 15 minutes (hard session boundary).
 */
export async function createListenerToken(options: TokenOptions): Promise<string> {
  const apiKey = getEnvOrThrow('LIVEKIT_API_KEY');
  const apiSecret = getEnvOrThrow('LIVEKIT_API_SECRET');

  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.participantIdentity,
    name: options.participantName,
    ttl: '15m', // 15-minute maximum session token TTL
  });

  // Open-mic participation: any passenger can publish audio tracks on unmute
  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
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
