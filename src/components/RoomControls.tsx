'use client';

import { useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';

interface RoomControlsProps {
  onLeave: () => void;
  onToggleSpeak: () => void;
  promoting?: boolean;
}

export function RoomControls({ onLeave, onToggleSpeak, promoting = false }: RoomControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const canPublish = localParticipant.permissions?.canPublish ?? false;
  const isMuted = !localParticipant.isMicrophoneEnabled;

  const toggleMute = useCallback(async () => {
    if (!canPublish) return;
    try {
      await localParticipant.setMicrophoneEnabled(isMuted);
    } catch (err) {
      console.error('Failed to toggle microphone track:', (err as Error).message);
    }
  }, [localParticipant, canPublish, isMuted]);

  // Keyboard shortcut: 'm' or 'M' to mute/unmute if speaker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.key === 'm' || e.key === 'M') && canPublish) {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute, canPublish]);

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
      {/* Speaker: Mute / Unmute Button */}
      {canPublish && (
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          title={isMuted ? 'Unmute microphone (Press M)' : 'Mute microphone (Press M)'}
          className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center gap-1.5 active:scale-95 ${
            isMuted
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
          }`}
        >
          {isMuted ? (
            <>
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Unmute</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Mute</span>
            </>
          )}
        </button>
      )}

      {/* Speaker: Step Down / Listener: Take the Mic */}
      {canPublish ? (
        <button
          onClick={onToggleSpeak}
          disabled={promoting}
          className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl glass-pill text-gray-300 hover:text-white text-xs font-semibold focus:outline-none transition-all active:scale-95"
        >
          {promoting ? 'Updating...' : 'Step Down'}
        </button>
      ) : (
        <button
          onClick={onToggleSpeak}
          disabled={promoting}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold text-xs disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(20,184,166,0.35)] flex items-center gap-1.5 focus:outline-none active:scale-95 whitespace-nowrap"
        >
          {promoting ? (
            <span>Requesting...</span>
          ) : (
            <>
              <span>🎙️</span>
              <span>Take Mic</span>
            </>
          )}
        </button>
      )}

      {/* Disconnect / Leave Platform */}
      <button
        onClick={handleDisconnect}
        aria-label="Leave station room"
        title="Leave station room"
        className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-medium text-xs transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-1 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Leave</span>
      </button>
    </div>
  );
}
