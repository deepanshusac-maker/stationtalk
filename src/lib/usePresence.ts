'use client';

import { useState, useEffect } from 'react';

interface PresenceData {
  counts: Record<string, number>;
  total: number;
  isLoading: boolean;
}

export function usePresence(pollIntervalMs = 8000): PresenceData {
  const [counts, setCounts] = useState<Record<string, number>>({});
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

  return { counts, total, isLoading };
}
