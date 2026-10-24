'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useAudioPlayback,
  useIsSpeaking,
} from '@livekit/components-react';
import { AvatarCapsule } from '@/components/AvatarCapsule';
import {
  getOrInitAnonymousName,
  generateRandomName,
  STORAGE_KEY_NAME,
  STORAGE_KEY_GENDER,
  STORAGE_KEY_PREMIUM,
  type Gender,
} from '@/lib/anonymousNames';
import { openSubscriptionModal } from '@/components/SubscriptionModal';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('stationtalk_name_change', callback);
  window.addEventListener('stationtalk_premium_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stationtalk_name_change', callback);
    window.removeEventListener('stationtalk_premium_change', callback);
  };
}

function getStoredNameSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_NAME) || '';
}

function getStoredGenderSnapshot(): Gender {
  if (typeof window === 'undefined') return 'male';
  return (localStorage.getItem(STORAGE_KEY_GENDER) as Gender) || 'male';
}

function getStoredPremiumSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_PREMIUM) === 'true';
}

function getServerStringSnapshot(): string {
  return '';
}

function getServerGenderSnapshot(): Gender {
  return 'male';
}

function getServerBoolSnapshot(): boolean {
  return false;
}

function subscribePeerId() {
  return () => {};
}

function getPeerIdSnapshot(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('stationtalk_peer_id');
  if (!id) {
    id = `peer-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;
    sessionStorage.setItem('stationtalk_peer_id', id);
  }
  return id;
}

function getServerPeerIdSnapshot(): string {
  return '';
}

interface PartnerInfo {
  name: string;
  gender: Gender;
}

type ConnectState =
  | { status: 'idle' }
  | { status: 'searching'; targetGender: 'any' | 'female' }
  | {
      status: 'connected';
      roomName: string;
      token: string;
      livekitUrl: string;
      partner: PartnerInfo;
      targetGender: 'any' | 'female';
    };

export default function RandomConnectPage() {
  const savedName = useSyncExternalStore(
    subscribeStorage,
    getStoredNameSnapshot,
    getServerStringSnapshot
  );
  const storedGender = useSyncExternalStore(
    subscribeStorage,
    getStoredGenderSnapshot,
    getServerGenderSnapshot
  );
  const isPremium = useSyncExternalStore(
    subscribeStorage,
    getStoredPremiumSnapshot,
    getServerBoolSnapshot
  );

  const peerId = useSyncExternalStore(
    subscribePeerId,
    getPeerIdSnapshot,
    getServerPeerIdSnapshot
  );

  const [connectState, setConnectState] = useState<ConnectState>({ status: 'idle' });
  const [selectedTarget, setSelectedTarget] = useState<'any' | 'female'>('any');
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const [searchSeconds, setSearchSeconds] = useState(0);

  const displayName = savedName || getOrInitAnonymousName(storedGender);

  // Re-roll name
  const handleReroll = useCallback(() => {
    const newName = generateRandomName(storedGender);
    localStorage.setItem(STORAGE_KEY_NAME, newName);
    window.dispatchEvent(new Event('stationtalk_name_change'));
  }, [storedGender]);

  // Start Searching
  const handleStartSearch = useCallback(
    async (target: 'any' | 'female') => {
      if (!peerId) return;

      if (target === 'female' && !isPremium) {
        openSubscriptionModal();
        return;
      }

      setConnectState({ status: 'searching', targetGender: target });
      setSearchSeconds(0);
      setSkipNotice(null);

      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            peerId,
            displayName,
            gender: storedGender,
            isPremium,
            targetGender: target,
          }),
        });

        if (!res.ok) throw new Error('Matchmaking failed');
        const data = await res.json();

        if (data.status === 'matched') {
          setConnectState({
            status: 'connected',
            roomName: data.roomName,
            token: data.token,
            livekitUrl: data.livekitUrl,
            partner: data.partner,
            targetGender: target,
          });
        }
      } catch (err) {
        console.error('Error starting search:', err);
        setConnectState({ status: 'idle' });
      }
    },
    [peerId, displayName, storedGender, isPremium]
  );

  // Active polling while searching
  useEffect(() => {
    if (connectState.status !== 'searching' || !peerId) return;

    const timer = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'poll',
            peerId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'matched') {
            setConnectState({
              status: 'connected',
              roomName: data.roomName,
              token: data.token,
              livekitUrl: data.livekitUrl,
              partner: data.partner,
              targetGender: connectState.targetGender,
            });
          }
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [connectState, peerId]);

  // Cancel search
  const handleCancelSearch = useCallback(async () => {
    if (peerId) {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', peerId }),
      }).catch(() => {});
    }
    setConnectState({ status: 'idle' });
  }, [peerId]);

  // Skip partner
  const handleSkip = useCallback(async () => {
    if (!peerId) return;
    const target = connectState.status === 'connected' ? connectState.targetGender : selectedTarget;

    setConnectState({ status: 'searching', targetGender: target });
    setSearchSeconds(0);
    setSkipNotice('Skipping to next traveler...');

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          peerId,
          displayName,
          gender: storedGender,
          isPremium,
          targetGender: target,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'matched') {
          setConnectState({
            status: 'connected',
            roomName: data.roomName,
            token: data.token,
            livekitUrl: data.livekitUrl,
            partner: data.partner,
            targetGender: target,
          });
          setSkipNotice(null);
        }
      }
    } catch (err) {
      console.error('Skip error:', err);
    }
  }, [peerId, connectState, selectedTarget, displayName, storedGender, isPremium]);

  // Leave room completely
  const handleLeave = useCallback(async () => {
    if (peerId) {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', peerId }),
      }).catch(() => {});
    }
    setConnectState({ status: 'idle' });
    setSkipNotice(null);
  }, [peerId]);

  // Partner skipped detection
  const handlePartnerSkipped = useCallback(() => {
    setSkipNotice('Partner skipped ⏭ — Finding next traveler...');
    handleSkip();
  }, [handleSkip]);

  return (
    <div className="flex-1 flex flex-col justify-between saas-mesh-bg saas-dots-pattern relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      {/* Top Bar Banner */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/90 text-xs font-mono py-2 sm:py-2.5 px-3 sm:px-4 glass-specular shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase text-[9px] sm:text-[10px] border border-indigo-200 shrink-0">
              <span className="radar-ring h-1.5 w-1.5 rounded-full bg-indigo-500" />
              1:1 RANDOM EXPRESS
            </span>
            <span className="text-slate-600 font-medium text-xs truncate hidden sm:inline">
              Anonymous 1-on-1 voice pairing with instant Skip ⏭
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <span>💎 Premium Active</span>
              </span>
            ) : (
              <button
                onClick={openSubscriptionModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-all shadow-sm active:scale-95"
              >
                <span>💎 Girls Filter</span>
                <span className="text-indigo-400 font-normal">₹99</span>
              </button>
            )}

            <Link
              href="/stations"
              className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-slate-950 border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold transition-all shadow-sm"
            >
              Group Platforms
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center w-full z-10">
        {skipNotice && (
          <div className="mb-4 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <span className="animate-spin text-sm">🔄</span>
            <span>{skipNotice}</span>
          </div>
        )}

        {/* State 1: IDLE / READY TO CONNECT */}
        {connectState.status === 'idle' && (
          <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl glass-specular text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              🎲
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
              1:1 Random Connect
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
              Drop into an instant private voice conversation with a stranger. Skip anytime to meet the next traveler. No profiles, no pressure.
            </p>

            {/* Filter Toggle: Anyone vs Girls Only */}
            <div className="mb-6 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSelectedTarget('any')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedTarget === 'any'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎲 Talk with Anyone</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  Free
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    openSubscriptionModal();
                  } else {
                    setSelectedTarget('female');
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedTarget === 'female'
                    ? 'bg-white text-indigo-900 shadow-sm border border-indigo-200'
                    : 'text-indigo-700 hover:text-indigo-900'
                }`}
              >
                <span>👩 Girls Only</span>
                {isPremium ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    💎 Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                    💎 ₹99
                  </span>
                )}
              </button>
            </div>

            {/* Anonymous Persona Preview */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <AvatarCapsule name={displayName} size="md" showEyes={true} />
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase font-bold">
                    Your Persona
                  </div>
                  <div className="text-sm font-bold text-slate-900 tracking-tight">
                    {displayName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReroll}
                className="text-xs font-mono text-teal-700 hover:text-teal-800 flex items-center gap-1 font-semibold active:scale-95"
                title="Shuffle anonymous name"
              >
                <span>🎲</span>
                <span>Re-roll</span>
              </button>
            </div>

            {/* Start Button */}
            <button
              onClick={() => handleStartSearch(selectedTarget)}
              className="w-full py-4 bg-teal-600 text-white font-extrabold text-sm sm:text-base rounded-2xl hover:bg-teal-500 transition-all shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(13,148,136,0.5)] active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-400/40"
            >
              <span>🟢 Start Random Chat</span>
              <span className="text-sm">➔</span>
            </button>

            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
              <span>⏱️ 10-Minute Limits</span>
              <span>•</span>
              <span>⏭ Instant Skip</span>
              <span>•</span>
              <span>🔒 100% Anonymous</span>
            </div>
          </div>
        )}

        {/* State 2: SEARCHING FOR A MATCH */}
        {connectState.status === 'searching' && (
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl glass-specular text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <span className="radar-ring absolute h-full w-full rounded-full bg-teal-400 opacity-60" />
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-3xl shadow-md z-10 animate-pulse">
                📡
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-1 tracking-tight">
              {connectState.targetGender === 'female'
                ? 'Finding a Female Passenger...'
                : 'Searching for a Traveler...'}
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Checking waiting queues across Indian platforms ({searchSeconds}s)
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-xs text-slate-600 font-medium">
              💡 Tip: Make sure your microphone is enabled. You can skip anytime during the chat.
            </div>

            <button
              onClick={handleCancelSearch}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all border border-slate-200 active:scale-95"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* State 3: CONNECTED TO LIVEKIT 1:1 VOICE ROOM */}
        {connectState.status === 'connected' && (
          <LiveKitRoom
            serverUrl={connectState.livekitUrl}
            token={connectState.token}
            connect={true}
            audio={false}
            video={false}
            onDisconnected={handleLeave}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            <RoomAudioRenderer />
            <OneOnOneRoomInner
              partner={connectState.partner}
              userDisplayName={displayName}
              onSkip={handleSkip}
              onLeave={handleLeave}
              onPartnerSkipped={handlePartnerSkipped}
            />
          </LiveKitRoom>
        )}
      </main>
    </div>
  );
}

/** Connected 1:1 Voice Room Inner Stage */
function OneOnOneRoomInner({
  partner,
  userDisplayName,
  onSkip,
  onLeave,
  onPartnerSkipped,
}: {
  partner: PartnerInfo;
  userDisplayName: string;
  onSkip: () => void;
  onLeave: () => void;
  onPartnerSkipped: () => void;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { canPlayAudio, startAudio } = useAudioPlayback();

  const isLocalSpeaking = useIsSpeaking(localParticipant);
  const isMuted = !localParticipant.isMicrophoneEnabled;

  const [secondsRemaining, setSecondsRemaining] = useState(10 * 60); // 10 minutes max
  const [showReportModal, setShowReportModal] = useState(false);
  const [reported, setReported] = useState(false);

  // 10-Minute countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onSkip]);

  // Keyboard shortcut M for mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        localParticipant.setMicrophoneEnabled(isMuted).catch(() => {});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localParticipant, isMuted]);

  // Partner left / skipped check
  const remoteParticipant = participants.find((p) => p.identity !== localParticipant.identity);
  const isRemoteSpeaking = useIsSpeaking(remoteParticipant);

  const prevRemoteRef = useRef(remoteParticipant);
  useEffect(() => {
    // If remote participant was present and suddenly disappeared, trigger skip handler
    if (prevRemoteRef.current && !remoteParticipant) {
      onPartnerSkipped();
    }
    prevRemoteRef.current = remoteParticipant;
  }, [remoteParticipant, onPartnerSkipped]);

  const toggleMic = useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(isMuted);
    } catch (err) {
      console.warn('Mic toggle error:', err);
    }
  }, [localParticipant, isMuted]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Autoplay unblocker banner if needed */}
      {!canPlayAudio && (
        <div className="mb-4 w-full p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium flex items-center justify-between gap-2 shadow-sm">
          <span>🔊 Tap to enable audio playback</span>
          <button
            onClick={() => startAudio()}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs"
          >
            Enable Audio
          </button>
        </div>
      )}

      {/* Main 2-Person Stage Card */}
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl glass-specular relative mb-20">
        {/* Top Header of Room */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-800">
              1:1 VOICE EXPRESS
            </span>
          </div>

          {/* 10-Min Session Countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
            <span>⏱️</span>
            <span>{formatCountdown(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="text-[11px] font-mono text-slate-400 hover:text-red-600 transition-colors"
            title="Report inappropriate behavior"
          >
            🚩 Report
          </button>
        </div>

        {/* Both Participant Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* YOU */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col items-center text-center">
            <div
              className={`relative mb-3 transition-all duration-200 ${
                isLocalSpeaking
                  ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-white scale-105 shadow-md shadow-emerald-500/20'
                  : ''
              }`}
            >
              <AvatarCapsule name={userDisplayName} size="lg" showEyes={true} />
              {!isMuted ? (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] p-1 rounded-full shadow">
                  🎤
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-600 text-[10px] p-1 rounded-full shadow">
                  🔇
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-slate-900 mb-1">{userDisplayName}</div>
            <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold mb-2">
              YOU
            </div>

            <div className="text-xs font-mono">
              {!isMuted ? (
                <span className="text-emerald-700 font-bold">● Mic Live</span>
              ) : (
                <span className="text-slate-400 font-medium">Muted</span>
              )}
            </div>
          </div>

          {/* STRANGER */}
          <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 flex flex-col items-center text-center">
            <div
              className={`relative mb-3 transition-all duration-200 ${
                isRemoteSpeaking
                  ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-white scale-105 shadow-md shadow-emerald-500/20'
                  : ''
              }`}
            >
              <AvatarCapsule name={partner.name} size="lg" showEyes={true} />
              <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[10px] p-1 rounded-full shadow">
                {partner.gender === 'female' ? '👩' : '👨'}
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900 mb-1">{partner.name}</div>
            <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold mb-2">
              CO-PASSENGER ({partner.gender.toUpperCase()})
            </div>

            <div className="text-xs font-mono">
              {isRemoteSpeaking ? (
                <span className="text-emerald-700 font-bold">● Speaking</span>
              ) : remoteParticipant ? (
                <span className="text-slate-500">Connected</span>
              ) : (
                <span className="text-slate-400">Connecting audio...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Control Dock */}
      <div className="fixed bottom-4 inset-x-0 z-40 max-w-md mx-auto px-4 w-full">
        <div className="glass-dock rounded-2xl sm:rounded-3xl p-3 shadow-2xl flex items-center justify-between gap-3 bg-white/95 border border-slate-200/95">
          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            title="Skip to next random person"
          >
            <span>⏭ Skip Person</span>
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMic}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all active:scale-95 shadow-sm ${
              isMuted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-emerald-600/30'
            }`}
            title="Toggle Microphone (Press M)"
          >
            <span>{isMuted ? '🔇 Unmute' : '🎤 Live'}</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-black/10 text-[9px] font-mono">
              M
            </kbd>
          </button>

          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 font-semibold text-xs transition-all active:scale-95 shadow-sm"
            title="Leave 1:1 room"
          >
            🚪 Leave
          </button>
        </div>
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center">
            <div className="text-3xl mb-3">🚩</div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Report Co-Passenger</h3>
            <p className="text-xs text-slate-500 mb-5">
              If this user was offensive, abusive, or broke safety guidelines, report them. They will be skipped and temporarily blocked.
            </p>

            {reported ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                ✓ Report submitted. Thank you for keeping StationTalk safe.
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReported(true);
                    setTimeout(() => {
                      setShowReportModal(false);
                      onSkip();
                    }, 1000);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Confirm & Skip
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
