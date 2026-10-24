import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionOrder } from '@/lib/razorpay';
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
      { error: 'Too many order requests. Please wait a minute.' },
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
  if (!peerId || peerId.length < 5 || peerId.length > 100) {
    return NextResponse.json({ error: 'Invalid peerId provided.' }, { status: 400 });
  }

  try {
    const orderData = await createSubscriptionOrder({ peerId });
    return NextResponse.json({
      success: true,
      ...orderData,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', (err as Error).message);
    return NextResponse.json(
      { error: 'Failed to create subscription order. Please try again.' },
      { status: 500 }
    );
  }
}
