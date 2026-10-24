import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

export interface SupabaseSubscription {
  peer_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  status: string;
  expires_at: string;
}

/**
 * Persists an active subscription record into Supabase.
 * Returns true if saved to Supabase, or false if it fell back.
 */
export async function persistSubscriptionToSupabase(params: {
  peerId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  expiresAt: number; // Unix timestamp ms
}): Promise<boolean> {
  const client = getSupabaseServerClient();
  if (!client) return false;

  try {
    const { error } = await client.from('subscriptions').upsert(
      {
        peer_id: params.peerId,
        razorpay_order_id: params.orderId,
        razorpay_payment_id: params.paymentId,
        amount: params.amount,
        status: 'active',
        expires_at: new Date(params.expiresAt).toISOString(),
      },
      { onConflict: 'peer_id' }
    );

    if (error) {
      console.warn('Supabase upsert note:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase persist error:', (err as Error).message);
    return false;
  }
}

/**
 * Checks Supabase for an active, unexpired subscription for a peerId.
 */
export async function querySubscriptionFromSupabase(peerId: string): Promise<boolean> {
  const client = getSupabaseServerClient();
  if (!client) return false;

  try {
    const { data, error } = await client
      .from('subscriptions')
      .select('peer_id, status, expires_at')
      .eq('peer_id', peerId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Supabase query note:', error.message);
      return false;
    }

    return Boolean(data);
  } catch (err) {
    console.warn('Supabase query error:', (err as Error).message);
    return false;
  }
}
