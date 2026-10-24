'use client';

import { useState, useEffect, useCallback, useSyncExternalStore, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
  useConnectionState,
  useLocalParticipant,
  useAudioPlayback,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { getStation, STATIONS, type Station } from '@/lib/stations';
import { RoomControls } from '@/components/RoomControls';
import { ParticipantTile } from '@/components/ParticipantTile';
import { AvatarCapsule } from '@/components/AvatarCapsule';
import { transitChime } from '@/lib/chime';
import {
  type Gender,
  generateRandomName,
  getOrInitAnonymousName,
  STORAGE_KEY_NAME,
} from '@/lib/anonymousNames';

type JoinState =
  | { status: 'idle' }
  | { status: 'joining' }
  | { status: 'connected'; token: string; url: string; identity: string }
  | { status: 'error'; message: string };

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('stationtalk_name_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stationtalk_name_change', callback);
  };
}

function getStoredNameSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_NAME) || '';
  } catch {
    return '';
  }
}

function getServerNameSnapshot(): string {
  return '';
}

function getStoredGenderSnapshot(): Gender {
  try {
    const g = localStorage.getItem('stationtalk_gender');
    return g === 'female' ? 'female' : 'male';
  } catch {
    return 'male';
  }
}

function getServerGenderSnapshot(): Gender {
  return 'male';
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[70vh]">
          <div className="text-center font-mono">
            <div className="animate-spin text-3xl mb-3">🚉</div>
            <p className="text-slate-500 text-sm font-medium">Loading station platform...</p>
          </div>
        </div>
      }
    >
      <RoomPageContent />
    </Suspense>
  );
}

function RoomPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [joinState, setJoinState] = useState<JoinState>({ status: 'idle' });
  const [customName, setCustomName] = useState<string | null>(null);

  // useSyncExternalStore prevents SSR hydration mismatch while reading from localStorage
  const savedName = useSyncExternalStore(
    subscribeStorage,
    getStoredNameSnapshot,
    getServerNameSnapshot
  );

  const gender = useSyncExternalStore(
    subscribeStorage,
    getStoredGenderSnapshot,
    getServerGenderSnapshot
  );

  const displayName = customName !== null ? customName : savedName;
  const [error, setError] = useState<string | null>(null);

  // Validate station synchronously
  const station = getStation(slug) ?? null;
  const notFound = station === null;

  const stationIndex = station ? STATIONS.findIndex((s) => s.slug === station.slug) : 0;
  const platformNumber = String(stationIndex + 1).padStart(2, '0');

  // Re-roll name draws from user's one-time chosen gender
  const handleRandomName = useCallback(() => {
    const chosen = generateRandomName(gender);
    setCustomName(chosen);
    try {
      localStorage.setItem(STORAGE_KEY_NAME, chosen);
      localStorage.setItem('stationtalk_passenger_name', chosen);
      window.dispatchEvent(new Event('stationtalk_name_change'));
    } catch {
      // Ignore storage errors
    }
  }, [gender]);

  const handleJoin = useCallback(async () => {
    const name = displayName.trim() || getOrInitAnonymousName(gender);
    if (!name) {
      setError('Please choose or enter your passenger name.');
      return;
    }
    if (name.length > 50) {
      setError('Display name must be 50 characters or fewer.');
      return;
    }

    setError(null);
    setJoinState({ status: 'joining' });

    try {
      localStorage.setItem(STORAGE_KEY_NAME, name);
      localStorage.setItem('stationtalk_passenger_name', name);
    } catch {
      // Ignore storage errors
    }

    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationSlug: slug,
          displayName: name,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server returned HTTP ${res.status}`);
      }

      const { token, url, identity } = await res.json();
      transitChime.playArrivalChime();
      setJoinState({
        status: 'connected',
        token,
        url,
        identity,
      });
    } catch (err) {
      const message = (err as Error).message || 'Failed to request room token.';
      setJoinState({ status: 'error', message });
    }
  }, [slug, displayName, gender]);

  const handleLeave = useCallback(() => {
    setJoinState({ status: 'idle' });
    setError(null);
  }, []);

  const handleBackToConcourse = useCallback(() => {
    router.push('/stations');
  }, [router]);

  // --- 404: Unregistered Station ---
  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh] bg-[#f8fafc]">
        <div className="text-center max-w-md p-8 rounded-2xl glass-panel border border-slate-200/90 shadow-xl">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Platform Not Found</h1>
          <p className="text-slate-600 text-sm mb-6">
            The platform &ldquo;{slug}&rdquo; is not part of the active railway registry.
          </p>
          <button
            onClick={handleBackToConcourse}
            className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            ← Return to Concourse
          </button>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-slate-400 font-mono">Loading station...</div>
      </div>
    );
  }

  // --- Join Form: Passenger Boarding Pass ---
  if (joinState.status === 'idle' || joinState.status === 'joining' || joinState.status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-[#f1f5f9] py-8 sm:py-12 saas-mesh-bg">
        <div className="w-full max-w-lg">
          {/* Breadcrumb Return */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
            <button
              onClick={handleBackToConcourse}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-400 rounded px-1.5 py-0.5"
            >
              <span>← Back to Concourse</span>
            </button>
            <span className="text-[11px] sm:text-xs font-mono text-slate-500 font-semibold">
              PF {platformNumber} • {station.region.toUpperCase()} LINE
            </span>
          </div>

          {/* Passenger Boarding Pass Card */}
          <div className="border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden glass-specular bg-white">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

            <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 sm:pb-5 mb-5 sm:mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                  PLATFORM BOARDING
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-slate-950 mt-2 tracking-tight">
                  {station.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">{station.city} · {station.state} • {station.description}</p>
              </div>

              <div className="text-right font-mono shrink-0 pl-2">
                <span className="text-xl sm:text-2xl font-black text-teal-600">PF {platformNumber}</span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{station.region} Line</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* Anonymous Handle with Shuffle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="display-name" className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                    Your Anonymous Handle
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomName}
                    className="text-[11px] font-mono text-teal-700 hover:text-teal-800 underline underline-offset-2 flex items-center gap-1 active:scale-95 font-semibold"
                  >
                    <span>🎲</span>
                    <span>Re-roll Name</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="display-name"
                    type="text"
                    placeholder="Enter anonymous name..."
                    value={displayName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    maxLength={50}
                    disabled={joinState.status === 'joining'}
                    suppressHydrationWarning
                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-500 font-bold transition-all text-sm shadow-sm"
                  />
                  {displayName.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AvatarCapsule name={displayName} size="sm" showEyes={true} />
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message with Recovery */}
              {(error || joinState.status === 'error') && (
                <div
                  className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-mono flex items-center justify-between gap-3"
                  role="alert"
                >
                  <span className="truncate">⚠️ {error || (joinState.status === 'error' ? joinState.message : '')}</span>
                  <button
                    onClick={() => {
                      setError(null);
                      setJoinState({ status: 'idle' });
                    }}
                    className="text-[11px] text-red-700 underline font-bold whitespace-nowrap"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Action Button: Board Platform as Passenger */}
              <div className="pt-2">
                <button
                  onClick={handleJoin}
                  disabled={joinState.status === 'joining'}
                  className="w-full py-4 bg-teal-600 text-white font-black text-sm rounded-2xl hover:bg-teal-500 disabled:opacity-50 transition-all shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(13,148,136,0.5)] flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-400/40 active:scale-[0.98]"
                >
                  {joinState.status === 'joining' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting to Platform...
                    </span>
                  ) : (
                    <>
                      <span>🎙️ Enter Station Lounge (15m Session)</span>
                      <span className="text-xs">➔</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>⏱️ 15-Minute Voice Session</span>
                <span>•</span>
                <span>Open Mic (Muted by default)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Connected: LiveKit Room ---
  return (
    <LiveKitRoom
      serverUrl={joinState.url}
      token={joinState.token}
      connect={true}
      audio={false}
      video={false}
      onDisconnected={handleLeave}
      onError={(err) => {
        if (err.message && err.message.toLowerCase().includes('client initiated disconnect')) {
          return;
        }
        console.error('LiveKit connection error:', err.message);
        setJoinState({
          status: 'error',
          message: `Connection failed: ${err.message}. Please check your network or credentials.`,
        });
      }}
    >
      <RoomAudioRenderer />
      <RoomViewInner
        station={station}
        platformNumber={platformNumber}
        onLeave={handleLeave}
        onReconnect={handleJoin}
      />
    </LiveKitRoom>
  );
}

/** Inner component that uses LiveKit context hooks and binds real-time events. */
function RoomViewInner({
  station,
  platformNumber,
  onLeave,
  onReconnect,
}: {
  station: Station;
  platformNumber: string;
  onLeave: () => void;
  onReconnect: () => void;
}) {
  const room = useRoomContext();
  const participants = useParticipants();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { canPlayAudio, startAudio } = useAudioPlayback();

  const [copied, setCopied] = useState(false);
  const [, setEventTick] = useState(0);

  // 15-minute maximum session timer (900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When session expired: cleanly disconnect and release media
  useEffect(() => {
    if (sessionExpired) {
      if (localParticipant?.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(false).catch(() => {});
      }
      room?.disconnect().catch(() => {});
      transitChime.playArrivalChime();
    }
  }, [sessionExpired, localParticipant, room]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Subscribe to LiveKit events to ensure participant lists & counts update on all state changes
  useEffect(() => {
    if (!room) return;
    const handleRoomEvent = () => setEventTick((prev) => prev + 1);

    room.on(RoomEvent.ParticipantConnected, handleRoomEvent);
    room.on(RoomEvent.ParticipantDisconnected, handleRoomEvent);
    room.on(RoomEvent.ParticipantPermissionsChanged, handleRoomEvent);
    room.on(RoomEvent.TrackPublished, handleRoomEvent);
    room.on(RoomEvent.TrackUnpublished, handleRoomEvent);
    room.on(RoomEvent.TrackSubscribed, handleRoomEvent);
    room.on(RoomEvent.TrackUnsubscribed, handleRoomEvent);
    room.on(RoomEvent.TrackMuted, handleRoomEvent);
    room.on(RoomEvent.TrackUnmuted, handleRoomEvent);
    room.on(RoomEvent.LocalTrackPublished, handleRoomEvent);
    room.on(RoomEvent.LocalTrackUnpublished, handleRoomEvent);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleRoomEvent);
      room.off(RoomEvent.ParticipantDisconnected, handleRoomEvent);
      room.off(RoomEvent.ParticipantPermissionsChanged, handleRoomEvent);
      room.off(RoomEvent.TrackPublished, handleRoomEvent);
      room.off(RoomEvent.TrackUnpublished, handleRoomEvent);
      room.off(RoomEvent.TrackSubscribed, handleRoomEvent);
      room.off(RoomEvent.TrackUnsubscribed, handleRoomEvent);
      room.off(RoomEvent.TrackMuted, handleRoomEvent);
      room.off(RoomEvent.TrackUnmuted, handleRoomEvent);
      room.off(RoomEvent.LocalTrackPublished, handleRoomEvent);
      room.off(RoomEvent.LocalTrackUnpublished, handleRoomEvent);
    };
  }, [room]);

  // Ensure local microphone track is released if component unmounts
  useEffect(() => {
    return () => {
      if (localParticipant?.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(false).catch(() => {});
      }
    };
  }, [localParticipant]);

  // Copy Room Link to Clipboard
  const handleCopyLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  // Clean room disconnection and resource release
  const handleLeaveRoom = useCallback(async () => {
    try {
      if (localParticipant?.isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      }
      await room?.disconnect();
    } catch (err) {
      console.warn('Error during room leave cleanup:', err);
    } finally {
      onLeave();
    }
  }, [localParticipant, room, onLeave]);

  // Session Expired Recovery Screen
  if (sessionExpired) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] p-4 bg-[#f1f5f9] saas-mesh-bg">
        <div className="text-center max-w-md p-6 sm:p-8 rounded-3xl border border-teal-500/30 shadow-2xl glass-specular animate-in fade-in duration-300 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            ⏳
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 mb-2 inline-block font-bold">
            15-MIN SESSION COMPLETED
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-2 mb-2 tracking-tight">
            Station Journey Concluded
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Platform sessions are capped at 15 minutes to keep conversations dynamic and give every passenger an opportunity to participate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSessionExpired(false);
                setSecondsRemaining(15 * 60);
                onReconnect();
              }}
              className="flex-1 py-3.5 bg-teal-600 text-white font-extrabold text-xs sm:text-sm rounded-xl hover:bg-teal-500 transition-all shadow-[0_10px_20px_-5px_rgba(13,148,136,0.35)] focus:outline-none focus:ring-2 focus:ring-teal-400 active:scale-95"
            >
              🔄 Board Fresh 15m Session
            </button>
            <button
              onClick={onLeave}
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-200 transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 active:scale-95"
            >
              ← Concourse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connection State: Connecting
  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-[#f1f5f9]">
        <div className="text-center font-mono p-4">
          <svg className="animate-spin h-10 w-10 text-teal-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-900 font-bold text-lg mb-1">Boarding Platform {platformNumber}...</p>
          <p className="text-slate-500 text-xs">Connecting to {station.name} audio stream</p>
        </div>
      </div>
    );
  }

  // Connection State: Reconnecting
  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-[#f1f5f9]">
        <div className="text-center font-mono max-w-sm p-8 rounded-2xl border border-teal-500/30 bg-white shadow-xl">
          <div className="text-4xl mb-4 animate-bounce">📡</div>
          <p className="text-teal-700 font-bold text-lg mb-1">Reconnecting Signal...</p>
          <p className="text-slate-500 text-xs">Network hiccup detected. LiveKit SFU is restoring your connection.</p>
        </div>
      </div>
    );
  }

  // Connection State: Disconnected (Recoverable UI)
  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] p-4 bg-[#f1f5f9]">
        <div className="text-center max-w-md p-8 rounded-2xl border border-slate-200/90 shadow-xl bg-white">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-xl font-bold mb-2 text-slate-900">Platform Disconnected</h2>
          <p className="text-slate-600 text-xs mb-6">
            You have left or been disconnected from {station.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onReconnect}
              className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              🔄 Reconnect
            </button>
            <button
              onClick={onLeave}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              ← Concourse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLocalMicLive = localParticipant?.isMicrophoneEnabled ?? false;
  const localName = localParticipant?.name || 'You';

  return (
    <div className="flex-1 flex flex-col justify-between saas-mesh-bg saas-dots-pattern min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      {/* Top Station Header & Status Bar */}
      <header className="bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 px-3 sm:px-4 py-2 sm:py-3 sticky top-14 sm:top-16 z-30 glass-specular shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Station Title & Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
              PF {platformNumber}
            </span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-bold text-slate-900 flex items-center gap-1.5 truncate">
                <span className="truncate">{station.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0 font-bold">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 truncate">
                {participants.length} {participants.length === 1 ? 'PASSENGER' : 'PASSENGERS'} IN STATION
              </p>
            </div>
          </div>

          {/* 15-Minute Countdown Timer & Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 15m Session Countdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-[11px] sm:text-xs font-mono bg-white border-slate-200 shadow-sm">
              <span className="text-xs">⏱️</span>
              <span
                className={
                  secondsRemaining < 60
                    ? 'text-red-600 font-bold animate-pulse'
                    : secondsRemaining < 180
                    ? 'text-amber-600 font-bold'
                    : 'text-teal-800 font-bold'
                }
                title="15-minute maximum session countdown"
              >
                {formatCountdown(secondsRemaining)}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-2.5 sm:px-3 py-1 rounded-xl glass-pill text-[11px] sm:text-xs font-mono text-slate-600 hover:text-slate-950 transition-all flex items-center gap-1 focus:outline-none"
              title="Copy room link to invite passengers"
            >
              {copied ? (
                <>
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span className="text-emerald-700 font-bold hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <Link
              href="/stations"
              className="px-2.5 sm:px-3 py-1 rounded-xl glass-pill text-[11px] sm:text-xs font-mono text-slate-600 hover:text-slate-950 transition-colors"
            >
              Concourse
            </Link>
          </div>
        </div>
      </header>

      {/* Main Room Stage: Unified Platform Lounge */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1 w-full relative z-10 pb-28">
        {/* Browser Autoplay Policy Warning */}
        {!canPlayAudio && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-3xl glass-panel border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl">🔊</span>
              <div>
                <div className="text-xs font-bold text-amber-900 font-mono">
                  Room Audio Muted by Browser Policy
                </div>
                <div className="text-[11px] text-amber-700">
                  Tap to enable remote participant audio playback.
                </div>
              </div>
            </div>
            <button
              onClick={() => startAudio()}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all shadow-md shadow-teal-600/20 whitespace-nowrap active:scale-95"
            >
              Unmute Room Audio
            </button>
          </div>
        )}

        {/* Unified Station Lounge Grid */}
        <div className="glass-specular rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] bg-white border border-slate-200/90">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>🚉</span>
                <span>Station Lounge</span>
              </span>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                {participants.length} {participants.length === 1 ? 'Passenger' : 'Passengers'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
              Open Audio Lounge • Unmute below to talk
            </span>
          </div>

          {participants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4">
              {participants.map((p) => (
                <ParticipantTile key={p.identity} participant={p} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <div className="text-2xl sm:text-3xl mb-2">🚉</div>
              <p className="text-xs sm:text-sm text-slate-900 font-bold">The lounge is quiet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                You are on the platform. Unmute below to begin talking, or share the link to invite friends.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Glass Dock Controls */}
      <footer className="fixed bottom-3 inset-x-0 z-40 max-w-lg mx-auto px-3 w-full">
        <div className="glass-dock rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-2xl flex items-center justify-between gap-2 bg-white/95 border-slate-200/95">
          {/* User Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <AvatarCapsule name={localName} size="sm" showEyes={true} />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 tracking-tight truncate max-w-[90px] sm:max-w-[130px]">
                {localName}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {isLocalMicLive ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Mic Live</span>
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Muted</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Simple Microphone Toggle & Leave */}
          <RoomControls onLeave={handleLeaveRoom} />
        </div>
      </footer>
    </div>
  );
}
