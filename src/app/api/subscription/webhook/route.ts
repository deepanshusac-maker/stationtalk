import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordSubscription } from '@/lib/razorpay';

/**
 * Razorpay Server-to-Server Webhook.
 *
 * This provides guaranteed payment verification even if the customer's
 * browser disconnects, phone battery dies, or tab is closed immediately after paying.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook signature or secret.' }, { status: 400 });
  }

  const rawBody = await request.text();

  // Cryptographic HMAC SHA256 verification of the raw webhook body
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.warn('Invalid Razorpay webhook signature attempt.');
    return NextResponse.json({ error: 'Signature mismatch.' }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const eventType = event.event as string;

  // Process successful payments
  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    const payload = event.payload as Record<string, Record<string, unknown>> | undefined;
    const payment = payload?.payment?.entity as Record<string, unknown> | undefined;
    const notes = payment?.notes as Record<string, string> | undefined;

    const peerId = notes?.peerId;
    const paymentId = payment?.id as string;
    const orderId = (payment?.order_id as string) || (event.order_id as string) || 'webhook_order';
    const amount = (payment?.amount as number) || 9900;

    if (peerId && paymentId) {
      await recordSubscription({
        peerId,
        orderId,
        paymentId,
        amount,
      });
    }
  }

  return NextResponse.json({ status: 'ok' });
}
