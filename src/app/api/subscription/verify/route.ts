import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, recordSubscription, isPaymentAlreadyClaimed } from '@/lib/razorpay';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const rateLimitResult = checkRateLimit(ip, {
    maxRequests: 20,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const peerId = typeof body.peerId === 'string' ? body.peerId.trim() : '';
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : '';
  const signature = typeof body.signature === 'string' ? body.signature.trim() : '';

  if (!peerId || !orderId || !paymentId) {
    return NextResponse.json(
      { error: 'Missing required payment verification fields.' },
      { status: 400 }
    );
  }

  // SEC-03 FIX: Prevent payment signature reuse/replay across different peerIds
  if (isPaymentAlreadyClaimed(paymentId, peerId)) {
    return NextResponse.json(
      { error: 'This payment transaction has already been redeemed.' },
      { status: 409 }
    );
  }

  const isValid = verifyPaymentSignature({ orderId, paymentId, signature });

  if (!isValid) {
    return NextResponse.json(
      { error: 'Payment signature verification failed.' },
      { status: 400 }
    );
  }

  const record = await recordSubscription({ peerId, orderId, paymentId });

  return NextResponse.json({
    success: true,
    isPremium: true,
    expiresAt: record.expiresAt,
  });
}
