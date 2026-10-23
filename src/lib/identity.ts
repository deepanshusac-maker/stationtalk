/**
 * Participant identity generation.
 *
 * Generates unique, server-validated participant identities
 * using crypto.randomUUID().
 */

import { randomUUID } from 'crypto';

/**
 * Generate a unique participant identity.
 * Format: "user-<uuid>" — guaranteed unique per call.
 */
export function generateParticipantIdentity(): string {
  return `user-${randomUUID()}`;
}

/**
 * Validate a participant identity string.
 * Must match the format produced by generateParticipantIdentity().
 */
export function isValidIdentity(identity: string): boolean {
  return /^user-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(identity);
}
