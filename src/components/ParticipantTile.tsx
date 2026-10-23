'use client';

import { type Participant } from 'livekit-client';
import { useIsSpeaking } from '@livekit/components-react';
import { AvatarCapsule } from './AvatarCapsule';

interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const isSpeaking = useIsSpeaking(participant);
  const isMuted = !participant.isMicrophoneEnabled;
  const canPublish = participant.permissions?.canPublish ?? false;
  const displayName = participant.name || participant.identity;

  return (
    <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-[#131926] border border-[#212b3c] hover:border-[#334158] transition-all duration-200 shadow-md">
      {/* Avatar Container with speaking glow */}
      <div
        className={`relative transition-all duration-200 ${
          isSpeaking
            ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-[#0b0f17] scale-105 shadow-lg shadow-emerald-500/25'
            : ''
        }`}
      >
        <AvatarCapsule
          name={displayName}
          size="lg"
          showEyes={displayName.length <= 4 || displayName.toLowerCase().includes('passenger')}
          className="shadow-lg"
        />

        {/* Speaker Mic Indicator */}
        {canPublish && (
          <span className="absolute -bottom-1 -right-1 bg-teal-500 text-gray-950 text-[10px] font-bold p-1 rounded-full shadow-md">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}

        {/* Muted icon */}
        {canPublish && isMuted && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] p-1 rounded-full shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Name & Animated Speaking Decibel Visualizer */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span
          className="text-xs sm:text-sm font-semibold text-white truncate max-w-[5.5rem] sm:max-w-[7rem]"
          title={displayName}
        >
          {displayName}
        </span>

        {isSpeaking ? (
          <div className="flex items-end gap-0.5 h-4 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span className="w-0.5 bg-emerald-400 rounded-full speaking-bar-1" />
            <span className="w-0.5 bg-emerald-400 rounded-full speaking-bar-2" />
            <span className="w-0.5 bg-emerald-400 rounded-full speaking-bar-3" />
            <span className="w-0.5 bg-emerald-400 rounded-full speaking-bar-4" />
          </div>
        ) : (
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            {canPublish ? 'Speaker' : 'Listener'}
          </span>
        )}
      </div>
    </div>
  );
}
