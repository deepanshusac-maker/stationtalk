'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';

interface RoomControlsProps {
  onLeave: () => void;
}

export function RoomControls({ onLeave }: RoomControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const isMuted = !localParticipant.isMicrophoneEnabled;
  const [micBusy, setMicBusy] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const toggleMute = useCallback(async () => {
    if (micBusy) return;
    setMicBusy(true);
    setMicError(null);
    try {
      await localParticipant.setMicrophoneEnabled(isMuted);
    } catch (err) {
      const msg = (err as Error).message || 'Microphone error';
      if (
        msg.toLowerCase().includes('permission') ||
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('notallowed')
      ) {
        setMicError('Microphone blocked. Please allow mic permission in your browser.');
      } else {
        setMicError('Failed to access microphone. Please check your audio settings.');
      }
    } finally {
      setMicBusy(false);
    }
  }, [localParticipant, isMuted, micBusy]);

  // Keyboard shortcut: 'm' or 'M' to mute/unmute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  const handleDisconnect = useCallback(async () => {
    try {
      if (localParticipant.isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      }
    } catch (err) {
      console.warn('Error releasing microphone resources on leave:', (err as Error).message);
    } finally {
      onLeave();
    }
  }, [localParticipant, onLeave]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Mic error toast tooltip */}
      {micError && (
        <div className="fixed bottom-20 inset-x-0 z-50 max-w-sm mx-auto px-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-mono flex items-center justify-between gap-2 shadow-2xl backdrop-blur-md">
            <span>⚠️ {micError}</span>
            <button
              onClick={() => setMicError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-sm px-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Microphone Toggle Button */}
      <button
        onClick={toggleMute}
        disabled={micBusy}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        title={isMuted ? 'Unmute microphone (Press M)' : 'Mute microphone (Press M)'}
        className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-400/40 flex items-center gap-2 active:scale-95 shadow-sm ${
          isMuted
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 shadow-sm'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
        }`}
      >
        {isMuted ? (
          <>
            <svg className="w-4 h-4 shrink-0 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Unmute Mic</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-mono border border-slate-300">M</kbd>
          </>
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span>Mic Open (Mute)</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-700/60 text-white text-[10px] font-mono border border-emerald-500">M</kbd>
          </>
        )}
      </button>

      {/* Disconnect / Leave Platform */}
      <button
        onClick={handleDisconnect}
        aria-label="Leave station lounge"
        title="Leave station lounge and return to concourse"
        className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 font-semibold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-1.5 active:scale-95 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Leave</span>
      </button>
    </div>
  );
}
