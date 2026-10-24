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
  const displayName = participant.name || participant.identity;

  return (
    <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500/40 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Avatar Container with speaking pulse */}
      <div
        className={`relative transition-all duration-200 ${
          isSpeaking
            ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-white scale-105 shadow-lg shadow-emerald-500/20'
            : ''
        }`}
      >
        <AvatarCapsule
          name={displayName}
          size="md"
          showEyes={true}
          className="shadow-sm"
        />

        {/* Live Mic Indicator badge on avatar */}
        {!isMuted ? (
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold p-1 rounded-full shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : (
          <span className="absolute -bottom-1 -right-1 bg-slate-100 text-slate-400 text-[10px] p-1 rounded-full border border-slate-200 shadow-sm">
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

      {/* Name & Speaking Visualizer */}
      <div className="flex flex-col items-center gap-1 text-center w-full min-w-0">
        <span
          className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[5.5rem] sm:max-w-[7rem] tracking-tight"
          title={displayName}
        >
          {displayName}
        </span>

        {isSpeaking ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 font-bold">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-1" />
              <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-2" />
              <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-3" />
              <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-4" />
            </div>
            <span>Speaking</span>
          </div>
        ) : !isMuted ? (
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mic Open</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-medium">
            <span>Muted</span>
          </div>
        )}
      </div>
    </div>
  );
}
