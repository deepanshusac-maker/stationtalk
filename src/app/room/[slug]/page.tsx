'use client';

import { useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useConnectionState,
  useLocalParticipant,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { getStation, type Station, STATIONS } from '@/lib/stations';
import { ParticipantTile } from '@/components/ParticipantTile';
import { RoomControls } from '@/components/RoomControls';

type JoinState =
  | { status: 'idle' }
  | { status: 'joining' }
  | { status: 'connected'; token: string; url: string; identity: string }
  | { status: 'error'; message: string };

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[70vh]">
          <div className="text-center font-mono">
            <div className="animate-spin text-3xl mb-3">🚉</div>
            <p className="text-gray-400 text-sm">Loading station platform...</p>
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
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('stationtalk_passenger_name') || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [error, setError] = useState<string | null>(null);

  const handleRandomName = useCallback(() => {
    const num = Math.floor(100 + Math.random() * 900);
    const prefixes = ['Traveller', 'Commuter', 'Rider', 'Voyager', 'Passenger'];
    const chosen = `${prefixes[Math.floor(Math.random() * prefixes.length)]} #${num}`;
    setDisplayName(chosen);
    try {
      localStorage.setItem('stationtalk_passenger_name', chosen);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Validate station synchronously
  const station = getStation(slug) ?? null;
  const notFound = station === null;

  const stationIndex = station ? STATIONS.findIndex((s) => s.slug === station.slug) : 0;
  const platformNumber = String(stationIndex + 1).padStart(2, '0');

  const handleJoin = useCallback(async () => {
    const name = displayName.trim();
    if (!name) {
      setError('Please enter your passenger / display name.');
      return;
    }
    if (name.length > 50) {
      setError('Display name must be 50 characters or fewer.');
      return;
    }

    setError(null);
    setJoinState({ status: 'joining' });

    try {
      localStorage.setItem('stationtalk_passenger_name', name);
    } catch {
      // Ignore storage errors
    }

    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationSlug: slug, displayName: name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const { token, url, identity } = await res.json();
      setJoinState({ status: 'connected', token, url, identity });
    } catch (err) {
      const message = (err as Error).message || 'Failed to join room.';
      setJoinState({ status: 'error', message });
    }
  }, [slug, displayName]);

  const handleLeave = useCallback(() => {
    setJoinState({ status: 'idle' });
    setDisplayName('');
    setError(null);
  }, []);

  const handleBackToConcourse = useCallback(() => {
    router.push('/stations');
  }, [router]);

  // --- 404: Unregistered Station ---
  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh] bg-concourse-pattern">
        <div className="text-center max-w-md p-8 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Station Platform Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">
            The platform &ldquo;{slug}&rdquo; is not part of the active railway registry.
          </p>
          <button
            onClick={handleBackToConcourse}
            className="w-full py-3 bg-amber-500 text-gray-950 font-bold rounded-xl hover:bg-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            ← Return to Concourse Directory
          </button>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-gray-400 font-mono">Loading station...</div>
      </div>
    );
  }

  // --- Join Form: Boarding Pass Modal ---
  if (joinState.status === 'idle' || joinState.status === 'joining' || joinState.status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-concourse-pattern py-12">
        <div className="w-full max-w-lg">
          {/* Breadcrumb Return */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToConcourse}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1.5 py-0.5"
            >
              <span>← Back to Concourse Directory</span>
            </button>
            <span className="text-xs font-mono text-gray-500">
              PF {platformNumber} • {station.region.toUpperCase()} LINE
            </span>
          </div>

          {/* Passenger Boarding Pass Card */}
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

            {/* Boarding Pass Header */}
            <div className="flex items-start justify-between border-b border-gray-800/80 pb-5 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  PLATFORM BOARDING PASS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  {station.name}
                </h1>
                <p className="text-xs text-gray-400 mt-1">{station.description}</p>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-amber-400">PF {platformNumber}</span>
                <span className="block text-[10px] text-gray-500 uppercase">{station.region} Sector</span>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="display-name" className="text-xs font-mono text-gray-300">
                    Your Passenger / Display Name
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomName}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline underline-offset-2"
                  >
                    🎲 Quick Random
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="display-name"
                    type="text"
                    placeholder="Enter your name (e.g. Maya)..."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    maxLength={50}
                    disabled={joinState.status === 'joining'}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-medium transition-all"
                  />
                  {displayName.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      {displayName.trim()[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {(error || joinState.status === 'error') && (
                <div
                  className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono"
                  role="alert"
                >
                  ⚠️ {error || (joinState.status === 'error' ? joinState.message : '')}
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={handleJoin}
                disabled={joinState.status === 'joining'}
                className="w-full py-3.5 bg-amber-500 text-gray-950 font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
              >
                {joinState.status === 'joining' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Authenticating with SFU Cloud...</span>
                  </>
                ) : (
                  <>
                    <span>🎧 Step Onto Platform as Listener</span>
                    <span className="text-xs">➔</span>
                  </>
                )}
              </button>

              {/* Permissions Explainer */}
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-2 text-gray-300 font-semibold">
                  <span>🔒 Listener-First Experience</span>
                </div>
                <p>
                  You will join in pure listen-only mode (`canPublish: false`). When inside, you can request to speak or promote to speaker in dev mode.
                </p>
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
        console.error('LiveKit room error:', err.message);
      }}
    >
      <RoomAudioRenderer />
      <RoomViewInner
        station={station}
        platformNumber={platformNumber}
        onLeave={handleLeave}
      />
    </LiveKitRoom>
  );
}

/** Inner component that uses LiveKit context hooks. */
function RoomViewInner({
  station,
  platformNumber,
  onLeave,
}: {
  station: Station;
  platformNumber: string;
  onLeave: () => void;
}) {
  const participants = useParticipants();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const [devPromoting, setDevPromoting] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const speakers = participants.filter((p) => p.permissions?.canPublish);
  const listeners = participants.filter((p) => !p.permissions?.canPublish);

  // Copy Room Link to Clipboard
  const handleCopyLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  // Dev-only speaker promotion
  const handleDevPromote = useCallback(async () => {
    setDevPromoting(true);
    setMicError(null);
    try {
      await localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      const msg = (err as Error).message || 'Unknown error';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
        setMicError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('unavailable')) {
        setMicError('No microphone device found. Please connect a microphone.');
      } else {
        setMicError(`Failed to enable microphone: ${msg}`);
      }
    } finally {
      setDevPromoting(false);
    }
  }, [localParticipant]);

  // Connection state UI
  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-concourse-pattern">
        <div className="text-center font-mono">
          <svg className="animate-spin h-10 w-10 text-amber-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white font-bold text-lg mb-1">Boarding Platform {platformNumber}...</p>
          <p className="text-gray-400 text-xs">Connecting to {station.name} audio stream</p>
        </div>
      </div>
    );
  }

  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-concourse-pattern">
        <div className="text-center font-mono max-w-sm p-8 rounded-2xl bg-gray-900 border border-amber-500/30">
          <div className="text-4xl mb-4 animate-bounce">📡</div>
          <p className="text-amber-400 font-bold text-lg mb-1">Reconnecting Signal...</p>
          <p className="text-gray-400 text-xs">Network hiccup detected. LiveKit SFU is restoring your connection.</p>
        </div>
      </div>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] p-4 bg-concourse-pattern">
        <div className="text-center max-w-md p-8 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-xl font-bold mb-2">Platform Disconnected</h2>
          <p className="text-gray-400 text-xs mb-6">
            You have left or been disconnected from {station.name}.
          </p>
          <button
            onClick={onLeave}
            className="w-full py-3 bg-amber-500 text-gray-950 font-bold rounded-xl hover:bg-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            ← Return to Concourse
          </button>
        </div>
      </div>
    );
  }

  const isCanPublish = localParticipant.permissions?.canPublish ?? false;

  return (
    <div className="flex-1 flex flex-col justify-between bg-concourse-pattern">
      {/* Top Station Header & Status Bar */}
      <header className="bg-gray-950/80 border-b border-gray-800/80 px-4 py-3 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-800 text-amber-400 border border-gray-700">
              PF {platformNumber}
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{station.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● ON AIR
                </span>
              </h1>
              <p className="text-[11px] font-mono text-gray-400">
                {station.region.toUpperCase()} LINE • {participants.length} {participants.length === 1 ? 'PERSON' : 'PEOPLE'} IN STATION
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/80 hover:bg-gray-700 text-xs font-mono text-gray-300 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              title="Copy room link to invite listeners"
            >
              {copied ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Share Room</span>
                </>
              )}
            </button>

            <Link
              href="/stations"
              className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs font-mono text-gray-400 transition-colors"
            >
              Concourse
            </Link>
          </div>
        </div>
      </header>

      {/* Main Room Stage */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Stage Speakers Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono tracking-wider text-amber-400 uppercase">
                🎙️ Stage Speakers
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {speakers.length} Active
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500">
              Broadcasting via WebRTC
            </span>
          </div>

          {speakers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {speakers.map((p) => (
                <ParticipantTile key={p.identity} participant={p} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-gray-900/30 border border-dashed border-gray-800 text-center">
              <div className="text-3xl mb-2">🎙️</div>
              <p className="text-sm text-gray-400 font-medium">Stage is open.</p>
              <p className="text-xs text-gray-500 mt-1">
                No active speakers on the microphone. Use dev mode below to take the stage.
              </p>
            </div>
          )}
        </div>

        {/* Platform Listeners / Audience Section */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono tracking-wider text-gray-300 uppercase">
                🎧 Concourse Audience
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {listeners.length} Listening
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500">
              Listener-only mode
            </span>
          </div>

          {listeners.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {listeners.map((p) => (
                <ParticipantTile key={p.identity} participant={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 font-mono text-xs">
              All room participants are currently on stage.
            </div>
          )}
        </div>
      </main>

      {/* Mic error notice */}
      {micError && (
        <div className="max-w-5xl mx-auto px-4 mb-3 w-full">
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
            ⚠️ {micError}
          </div>
        </div>
      )}

      {/* Sticky Bottom Room Controls */}
      <footer className="border-t border-gray-800/80 bg-gray-950/90 backdrop-blur-md py-3 sticky bottom-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <RoomControls onLeave={onLeave} />

          {/* Dev-only promotion card */}
          {!isCanPublish && (
            <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="text-xs font-bold text-amber-300 font-mono">
                  ⚠️ [DEV MODE] Test Microphone Promotion
                </div>
                <div className="text-[11px] text-gray-400">
                  Client-side self promotion for Phase 1 testing. Bypasses moderator request queue.
                </div>
              </div>

              <button
                onClick={handleDevPromote}
                disabled={devPromoting}
                className="px-4 py-2 rounded-lg bg-amber-500 text-gray-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {devPromoting ? 'Requesting Mic...' : 'Take the Stage (Enable Mic)'}
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
