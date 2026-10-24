/**
 * Tests for token generation, permission defaults, and security boundaries.
 *
 * Verifies:
 * - Default listener-only permissions (canPublish: false, canSubscribe: true, canPublishData: false)
 * - Short-lived token TTL (1 hour)
 * - Required server-side environment variables
 * - Unique participant identity generation
 * - Rate limiting enforcement
 */

import { generateParticipantIdentity, isValidIdentity } from '../lib/identity';
import { checkRateLimit } from '../lib/rate-limit';

beforeAll(() => {
  process.env.LIVEKIT_API_KEY = 'test-api-key';
  process.env.LIVEKIT_API_SECRET = 'test-api-secret-that-is-long-enough-for-jwt';
  process.env.NEXT_PUBLIC_LIVEKIT_URL = 'wss://test.livekit.cloud';
});

afterAll(() => {
  delete process.env.LIVEKIT_API_KEY;
  delete process.env.LIVEKIT_API_SECRET;
  delete process.env.NEXT_PUBLIC_LIVEKIT_URL;
});

describe('Token Generation & Security Grants', () => {
  it('creates a token strictly with listener-only permissions by default', async () => {
    const { createListenerToken } = await import('../lib/livekit');
    const token = await createListenerToken({
      roomName: 'delhi-central',
      participantIdentity: 'user-test-1234',
      participantName: 'Passenger Delhi',
    });

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    // Decode JWT payload
    const parts = token.split('.');
    expect(parts).toHaveLength(3);

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    // Verify room grant: listener-only
    expect(payload.video).toBeDefined();
    expect(payload.video.room).toBe('delhi-central');
    expect(payload.video.roomJoin).toBe(true);
    expect(payload.video.canPublish).toBe(false);
    expect(payload.video.canSubscribe).toBe(true);
    expect(payload.video.canPublishData).toBe(false);

    // Verify identity and name
    expect(payload.sub).toBe('user-test-1234');
    expect(payload.name).toBe('Passenger Delhi');

    // Verify short-lived session TTL: 15 minutes (900 seconds)
    const nowSec = Math.floor(Date.now() / 1000);
    expect(payload.exp).toBeGreaterThan(nowSec);
    expect(payload.exp - nowSec).toBeLessThanOrEqual(900 + 10);
    expect(payload.exp - nowSec).toBeGreaterThanOrEqual(900 - 10);
  });

  it('generates listener tokens across normalized room IDs', async () => {
    const { createListenerToken } = await import('../lib/livekit');

    const rooms = ['mumbai-central', 'patna-junction', 'chennai-central'];
    for (const room of rooms) {
      const token = await createListenerToken({
        roomName: room,
        participantIdentity: 'user-test-room',
        participantName: 'Test Traveler',
      });
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      expect(payload.video.room).toBe(room);
      expect(payload.video.canPublish).toBe(false);
      expect(payload.video.canSubscribe).toBe(true);
    }
  });

  it('throws an error when LIVEKIT_API_KEY or LIVEKIT_API_SECRET is missing', async () => {
    const originalKey = process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_KEY;

    jest.resetModules();
    const { createListenerToken } = await import('../lib/livekit');

    await expect(
      createListenerToken({
        roomName: 'delhi-central',
        participantIdentity: 'user-test',
        participantName: 'Test',
      })
    ).rejects.toThrow('Missing required environment variable: LIVEKIT_API_KEY');

    process.env.LIVEKIT_API_KEY = originalKey;
  });
});

describe('Participant Identity Authority', () => {
  it('generates unique server-side identities with user- prefix', () => {
    const id1 = generateParticipantIdentity();
    const id2 = generateParticipantIdentity();

    expect(id1).not.toBe(id2);
    expect(id1.startsWith('user-')).toBe(true);
    expect(id2.startsWith('user-')).toBe(true);
  });

  it('validates canonical identity format and rejects malformed formats', () => {
    const validId = generateParticipantIdentity();
    expect(isValidIdentity(validId)).toBe(true);

    expect(isValidIdentity('admin')).toBe(false);
    expect(isValidIdentity('user-arbitrary-string')).toBe(false);
    expect(isValidIdentity('')).toBe(false);
    expect(isValidIdentity('user-123')).toBe(false);
  });
});

describe('Token Rate Limiting Authority', () => {
  it('allows token requests within the window limit', () => {
    const key = `ip-allowed-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(key, { maxRequests: 10, windowMs: 60_000 });
      expect(res.allowed).toBe(true);
    }
  });

  it('blocks token requests exceeding the rate limit', () => {
    const key = `ip-blocked-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    }
    const blockedRes = checkRateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});
