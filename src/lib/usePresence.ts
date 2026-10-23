'use client';

import { useState, useEffect } from 'react';

export interface PresenceData {
  counts: Record<string, number>;
  participants: Record<string, string[]>;
  total: number;
  isLoading: boolean;
}

export function usePresence(pollIntervalMs = 4000): PresenceData {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [participants, setParticipants] = useState<Record<string, string[]>>({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPresence() {
      try {
        const res = await fetch('/api/presence', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setCounts(data.counts || {});
          setParticipants(data.participants || {});
          setTotal(data.total || 0);
          setIsLoading(false);
        }
      } catch {
        // Silently preserve previous counts on network blip
      }
    }

    fetchPresence();
    const interval = setInterval(fetchPresence, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return { counts, participants, total, isLoading };
}
