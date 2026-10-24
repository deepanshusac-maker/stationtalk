import {
  joinOrFindMatch,
  pollMatchStatus,
  skipCurrentMatch,
  leaveQueueOrMatch,
} from '@/lib/matchmaker';

// Mock livekit token generation
jest.mock('@/lib/livekit', () => ({
  createOneOnOneToken: jest.fn().mockResolvedValue('mock-1v1-token'),
  getLiveKitUrl: jest.fn().mockReturnValue('wss://mock.livekit.cloud'),
}));

describe('Matchmaker System', () => {
  beforeEach(() => {
    // Reset global store before each test
    globalThis.__stationtalk_matchmaker = {
      waitingQueue: new Map(),
      activeMatches: new Map(),
      lastCleanedAt: Date.now(),
    };
  });

  it('puts first user into waiting queue if no partner is available', async () => {
    const res = await joinOrFindMatch({
      peerId: 'peer-user-1',
      displayName: 'Aarav #12',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    expect(res.status).toBe('waiting');
    if (res.status === 'waiting') {
      expect(res.queueSize).toBe(1);
    }

    const pollRes = pollMatchStatus('peer-user-1');
    expect(pollRes.status).toBe('waiting');
  });

  it('pairs two free users when second user joins', async () => {
    // User 1 joins
    await joinOrFindMatch({
      peerId: 'peer-user-1',
      displayName: 'Aarav #12',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    // User 2 joins
    const res2 = await joinOrFindMatch({
      peerId: 'peer-user-2',
      displayName: 'Kabir #99',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    expect(res2.status).toBe('matched');
    if (res2.status === 'matched') {
      expect(res2.partner.name).toBe('Aarav #12');
      expect(res2.token).toBe('mock-1v1-token');
      expect(res2.roomName).toMatch(/^pvt-/);
    }

    // When User 1 polls, User 1 also gets the match
    const poll1 = pollMatchStatus('peer-user-1');
    expect(poll1.status).toBe('matched');
    if (poll1.status === 'matched') {
      expect(poll1.partner.name).toBe('Kabir #99');
    }
  });

  it('enforces female target filter for premium users', async () => {
    // Male user waiting in queue
    await joinOrFindMatch({
      peerId: 'male-free',
      displayName: 'Rohan #45',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    // Premium male user looking ONLY for female partner
    const premiumMaleRes = await joinOrFindMatch({
      peerId: 'male-premium',
      displayName: 'Vikram #88',
      gender: 'male',
      isPremium: true,
      targetGender: 'female',
    });

    // Should NOT match with male-free!
    expect(premiumMaleRes.status).toBe('waiting');

    // Now a female user joins
    const femaleRes = await joinOrFindMatch({
      peerId: 'female-user',
      displayName: 'Ananya #21',
      gender: 'female',
      isPremium: false,
      targetGender: 'any',
    });

    // Female matches with the waiting premium male looking for a female!
    expect(femaleRes.status).toBe('matched');
    if (femaleRes.status === 'matched') {
      expect(femaleRes.partner.name).toBe('Vikram #88');
    }
  });

  it('handles skip by re-queueing and notifying partner', async () => {
    // Pair two users
    await joinOrFindMatch({
      peerId: 'user-a',
      displayName: 'User A',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });
    await joinOrFindMatch({
      peerId: 'user-b',
      displayName: 'User B',
      gender: 'female',
      isPremium: false,
      targetGender: 'any',
    });

    // User A skips
    await skipCurrentMatch('user-a', {
      displayName: 'User A',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    // User B polls and detects partner skipped
    const pollB = pollMatchStatus('user-b');
    expect(pollB.status).toBe('partner_skipped');
  });

  it('removes user cleanly on leave', async () => {
    await joinOrFindMatch({
      peerId: 'user-temp',
      displayName: 'User Temp',
      gender: 'male',
      isPremium: false,
      targetGender: 'any',
    });

    leaveQueueOrMatch('user-temp');
    const poll = pollMatchStatus('user-temp');
    expect(poll.status).toBe('idle');
  });
});
