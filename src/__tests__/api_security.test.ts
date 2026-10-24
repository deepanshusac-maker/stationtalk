import { POST as matchPost } from '@/app/api/match/route';
import { POST as promotePost } from '@/app/api/promote/route';
import { recordSubscription } from '@/lib/razorpay';
import { NextRequest } from 'next/server';

describe('API Security Boundaries', () => {
  beforeEach(() => {
    globalThis.__stationtalk_subscriptions = {
      subscriptions: new Map(),
      claimedPaymentIds: new Set(),
    };
    globalThis.__stationtalk_matchmaker = {
      waitingQueue: new Map(),
      activeMatches: new Map(),
      lastCleanedAt: Date.now(),
    };
  });

  it('SEC-01: Rejects unverified client-supplied isPremium and falls back to free any-match', async () => {
    const req = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        peerId: 'peer-unpaid-attacker',
        displayName: 'Attacker #99',
        gender: 'male',
        isPremium: true, // Spoofed parameter
        targetGender: 'female', // Requested girls filter without paying
      }),
    });

    const res = await matchPost(req);
    expect(res.status).toBe(200);

    // Verify in waitingQueue that user was stored with isPremium: false and targetGender: 'any'
    const queueUser = globalThis.__stationtalk_matchmaker?.waitingQueue.get('peer-unpaid-attacker');
    expect(queueUser).toBeDefined();
    expect(queueUser?.isPremium).toBe(false);
    expect(queueUser?.targetGender).toBe('any');
  });

  it('SEC-01: Honors premium status when verified server-side in subscription store', async () => {
    // Record legitimate payment
    await recordSubscription({
      peerId: 'peer-legit-subscriber',
      orderId: 'order_123',
      paymentId: 'pay_123',
    });

    const req = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        peerId: 'peer-legit-subscriber',
        displayName: 'Legit #01',
        gender: 'male',
        isPremium: true,
        targetGender: 'female',
      }),
    });

    const res = await matchPost(req);
    expect(res.status).toBe(200);

    const queueUser = globalThis.__stationtalk_matchmaker?.waitingQueue.get('peer-legit-subscriber');
    expect(queueUser).toBeDefined();
    expect(queueUser?.isPremium).toBe(true);
    expect(queueUser?.targetGender).toBe('female');
  });

  it('SEC-02: Deactivates arbitrary remote participant demotion on /api/promote', async () => {
    const res = await promotePost();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toContain('deactivated');
  });
});
