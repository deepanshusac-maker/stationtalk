import {
  createSubscriptionOrder,
  verifyPaymentSignature,
  recordSubscription,
  isSubscriptionActive,
  isPaymentAlreadyClaimed,
} from '@/lib/razorpay';
import crypto from 'crypto';

describe('Razorpay Subscription Flow', () => {
  beforeEach(() => {
    globalThis.__stationtalk_subscriptions = {
      subscriptions: new Map(),
      claimedPaymentIds: new Set(),
    };
  });

  it('creates an order in sandbox mode when no credentials in env', async () => {
    const order = await createSubscriptionOrder({ peerId: 'test-peer-123' });
    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(9900);
    expect(order.currency).toBe('INR');
  });

  it('verifies signature correctly with mock sandbox orders in test env', () => {
    const isValid = verifyPaymentSignature({
      orderId: 'order_mock_12345',
      paymentId: 'pay_mock_12345',
      signature: 'any-sig',
    });
    expect(isValid).toBe(true);
  });

  it('verifies HMAC-SHA256 signature when secret is configured', () => {
    const secret = 'test_secret_key_123';
    process.env.RAZORPAY_KEY_SECRET = secret;

    const orderId = 'order_real_999';
    const paymentId = 'pay_real_999';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: expectedSignature,
    });

    expect(isValid).toBe(true);

    const isInvalid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: 'wrong-signature',
    });

    expect(isInvalid).toBe(false);

    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it('records subscription and marks active for 30 days', async () => {
    await recordSubscription({
      peerId: 'peer-abc',
      orderId: 'order-1',
      paymentId: 'pay-1',
    });

    const active = await isSubscriptionActive('peer-abc');
    const inactive = await isSubscriptionActive('peer-unknown');

    expect(active).toBe(true);
    expect(inactive).toBe(false);
  });

  it('detects and prevents payment ID replay across different peerIds', async () => {
    await recordSubscription({
      peerId: 'alice-peer-id',
      orderId: 'order-100',
      paymentId: 'pay-shared-999',
    });

    // Same peerId querying their own payment is allowed
    expect(isPaymentAlreadyClaimed('pay-shared-999', 'alice-peer-id')).toBe(false);

    // Another peerId attempting to claim the same payment ID is blocked
    expect(isPaymentAlreadyClaimed('pay-shared-999', 'bob-attacker-id')).toBe(true);
  });
});
