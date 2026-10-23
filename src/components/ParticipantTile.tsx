'use client';

import { type Participant } from 'livekit-client';
import { useIsSpeaking } from '@livekit/components-react';

interface ParticipantTileProps {
  participant: Participant;
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

function getAvatarColor(identity: string): string {
  const colors = [
    'from-amber-500 to-amber-700',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700',
    'from-purple-500 to-purple-700',
    'from-rose-500 to-rose-700',
    'from-cyan-500 to-cyan-700',
    'from-orange-500 to-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const isSpeaking = useIsSpeaking(participant);
  const isMuted = !participant.isMicrophoneEnabled;
  const canPublish = participant.permissions?.canPublish ?? false;
  const displayName = participant.name || participant.identity;

  return (
    <div className="flex flex-col items-center gap-2.5 p-3 rounded-2xl bg-gray-900/50 border border-gray-800/60 hover:border-gray-700/80 transition-all duration-200">
      {/* Avatar Container */}
      <div
        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg transition-all duration-200 bg-gradient-to-br ${getAvatarColor(
          participant.identity
        )} ${
          isSpeaking
            ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-gray-950 scale-105'
            : 'ring-1 ring-white/10'
        }`}
      >
        <span>{getInitials(displayName)}</span>

        {/* Speaker Mic Indicator */}
        {canPublish && (
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-gray-950 text-[10px] font-bold p-1 rounded-full shadow-md">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </span>
        )}

        {/* Muted icon */}
        {canPublish && isMuted && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] p-1 rounded-full shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {/* Name & Speaking Wave Indicator */}
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className="text-xs sm:text-sm font-medium text-gray-200 truncate max-w-[5.5rem] sm:max-w-[7rem]"
          title={displayName}
        >
          {displayName}
        </span>

        {isSpeaking ? (
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-3" />
            <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2" />
            <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-3.5" />
            <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2" />
          </div>
        ) : (
          <span className="text-[10px] font-mono text-gray-500 uppercase">
            {canPublish ? 'Speaker' : 'Listener'}
          </span>
        )}
      </div>
    </div>
  );
}
