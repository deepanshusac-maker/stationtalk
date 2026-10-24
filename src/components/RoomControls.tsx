'use client';

import { useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';

interface RoomControlsProps {
  onLeave: () => void;
  onRequestSpeak?: () => void;
}

export function RoomControls({ onLeave, onRequestSpeak }: RoomControlsProps) {
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
      // Explicitly disable and unpublish microphone to release browser media resources
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
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {/* Mute / Unmute (speakers only) */}
      {canPublish && (
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={isMuted ? 'Unmute microphone (Press M)' : 'Mute microphone (Press M)'}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              isMuted
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            }`}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.06] border border-white/[0.08] text-[9px]">M</kbd>
          </div>
        </div>
      )}

      {/* Request to speak (listeners only) */}
      {!canPublish && onRequestSpeak && (
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onRequestSpeak}
            aria-label="Request microphone"
            title="Request microphone to speak on stage"
            className="p-3.5 sm:p-4 rounded-2xl glass-pill text-teal-300 border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <span className="text-[10px] font-mono text-gray-400">Request Mic</span>
        </div>
      )}

      {/* Leave room */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={handleDisconnect}
          aria-label="Leave station room"
          title="Disconnect from audio room and return to concourse"
          className="p-3.5 sm:p-4 rounded-2xl bg-red-600/80 hover:bg-red-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        <span className="text-[10px] font-mono text-gray-400">Leave Platform</span>
      </div>
    </div>
  );
}
