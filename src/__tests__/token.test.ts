/**
 * Tests for token generation and permission defaults.
 *
 * These tests verify that token creation enforces the correct
 * default permissions (canPublish: false, canSubscribe: true).
 *
 * Note: These tests require LIVEKIT_API_KEY and LIVEKIT_API_SECRET
 * environment variables to be set. They use dummy values for testing.
 */

import { generateParticipantIdentity, isValidIdentity } from '../lib/identity';
import { checkRateLimit } from '../lib/rate-limit';

// Set dummy env vars for testing
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

describe('Token Generation', () => {
  it('creates a token with listener-only permissions by default', async () => {
    const { createToken } = await import('../lib/livekit');
    const token = await createToken({
      roomName: 'grand-central',
      participantIdentity: 'user-test-1234',
      participantName: 'Test User',
    });

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    // Decode and verify the token payload
    const parts = token.split('.');
    expect(parts).toHaveLength(3);

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    // Verify room grant
    expect(payload.video).toBeDefined();
    expect(payload.video.room).toBe('grand-central');
    expect(payload.video.roomJoin).toBe(true);
    expect(payload.video.canPublish).toBe(false);
    expect(payload.video.canSubscribe).toBe(true);
    expect(payload.video.canPublishData).toBe(false);
  });

  it('creates a token with speaker permissions when canPublish is true', async () => {
    const { createToken } = await import('../lib/livekit');
    const token = await createToken({
      roomName: 'grand-central',
      participantIdentity: 'user-test-5678',
      participantName: 'Speaker User',
      canPublish: true,
    });

    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    expect(payload.video.canPublish).toBe(true);
    expect(payload.video.canSubscribe).toBe(true);
  });

  it('sets correct identity and name in the token', async () => {
    const { createToken } = await import('../lib/livekit');
    const token = await createToken({
      roomName: 'harbour-bay',
      participantIdentity: 'user-abc-123',
      participantName: 'Alice',
    });

    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    expect(payload.sub).toBe('user-abc-123');
    expect(payload.name).toBe('Alice');
  });

  it('throws when LIVEKIT_API_KEY is missing', async () => {
    const originalKey = process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_KEY;

    // Re-import to get fresh module
    jest.resetModules();
    const { createToken } = await import('../lib/livekit');

    await expect(
      createToken({
        roomName: 'grand-central',
        participantIdentity: 'user-test',
        participantName: 'Test',
      })
    ).rejects.toThrow('Missing required environment variable: LIVEKIT_API_KEY');

    process.env.LIVEKIT_API_KEY = originalKey;
  });
});

describe('Participant Identity', () => {
  it('generates unique identities', () => {
    const id1 = generateParticipantIdentity();
    const id2 = generateParticipantIdentity();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^user-/);
    expect(id2).toMatch(/^user-/);
  });

  it('validates correct identity format', () => {
    const id = generateParticipantIdentity();

    expect(isValidIdentity(id)).toBe(true);
    expect(isValidIdentity('invalid')).toBe(false);
    expect(isValidIdentity('user-not-a-uuid')).toBe(false);
    expect(isValidIdentity('')).toBe(false);
  });
});

describe('Rate Limiting', () => {
  it('allows requests within the limit', () => {
    const key = `test-ip-${Date.now()}`;

    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(key, { maxRequests: 10, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks requests exceeding the limit', () => {
    const key = `test-ip-blocked-${Date.now()}`;

    // Exhaust the limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    }

    // Next request should be blocked
    const result = checkRateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('reports remaining count correctly', () => {
    const key = `test-ip-remaining-${Date.now()}`;

    const r1 = checkRateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    expect(r3.remaining).toBe(0);
  });
});
