'use client';

import React from 'react';

// Soft pastel palettes matching the reference screenshot
const CAPSULE_PALETTES = [
  { bg: 'bg-[#59b28a]', text: 'text-gray-950', ring: 'ring-[#459670]' }, // Mint green
  { bg: 'bg-[#9e85b9]', text: 'text-white', ring: 'ring-[#826b9c]' },    // Lavender purple
  { bg: 'bg-[#539ad5]', text: 'text-white', ring: 'ring-[#4280b5]' },    // Soft sky blue
  { bg: 'bg-[#dca54a]', text: 'text-gray-950', ring: 'ring-[#c48f38]' }, // Warm mustard/butterscotch
  { bg: 'bg-[#d9787e]', text: 'text-white', ring: 'ring-[#be6167]' },    // Coral rose
  { bg: 'bg-[#49a696]', text: 'text-white', ring: 'ring-[#3b8c7e]' },    // Soft teal
  { bg: 'bg-[#e699b0]', text: 'text-gray-950', ring: 'ring-[#cf8298]' }, // Blush pink
  { bg: 'bg-[#7b92cc]', text: 'text-white', ring: 'ring-[#6479ad]' },    // Periwinkle
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

interface AvatarCapsuleProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showEyes?: boolean;
  className?: string;
}

export function AvatarCapsule({
  name = '?',
  size = 'md',
  showEyes = false,
  className = '',
}: AvatarCapsuleProps) {
  const hash = hashString(name);
  const palette = CAPSULE_PALETTES[hash % CAPSULE_PALETTES.length];

  const sizeClasses = {
    sm: 'w-6 h-7 text-[10px] rounded-[10px]',
    md: 'w-7 h-8.5 text-xs rounded-[12px]',
    lg: 'w-9 h-11 text-sm rounded-[16px]',
  }[size];

  // If showEyes is true or name starts with Rider/Guest, render cute double-dot eyes
  const hasEyes = showEyes || (name.toLowerCase().startsWith('rider') && hash % 2 === 0);
  const initial = name.replace(/^(user-|rider-)/i, '').trim()[0]?.toUpperCase() || '?';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center font-bold shadow-[0_4px_12px_rgba(0,0,0,0.35)] ring-1 ring-white/15 select-none transition-transform duration-200 hover:scale-110 ${palette.bg} ${palette.text} ${sizeClasses} ${className}`}
      title={name}
    >
      {hasEyes ? (
        <div className="flex items-center gap-0.5 opacity-85">
          <span className="w-1 h-2 rounded-full bg-current inline-block transform -rotate-6" />
          <span className="w-1 h-2 rounded-full bg-current inline-block transform rotate-6" />
        </div>
      ) : (
        <span className="font-bold tracking-tight">{initial}</span>
      )}
    </div>
  );
}

interface AvatarClusterProps {
  names: string[];
  totalCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders an organic, clustered group of cute bean avatars
 * with an optional "+N" pill badge when the room has more participants.
 */
export function AvatarCluster({ names, totalCount, size = 'md' }: AvatarClusterProps) {
  const activeCount = totalCount ?? names.length;

  if (activeCount === 0) {
    return (
      <div className="w-16 h-12 flex items-center justify-end pr-2">
        <div
          className="w-7 h-8.5 rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-gray-500 text-xs font-semibold group-hover:border-teal-400/50 group-hover:text-teal-300 group-hover:bg-teal-500/10 transition-all duration-200"
          title="Empty platform — tap to join"
        >
          <span>+</span>
        </div>
      </div>
    );
  }

  // Display actual participant names
  const displayNames = names.length > 0 ? names.slice(0, 4) : Array.from({ length: Math.min(activeCount, 4) }, (_, i) => `Traveller ${i + 1}`);
  const remaining = Math.max(0, activeCount - displayNames.length);

  // Layout cluster configurations based on number of visible avatars
  if (displayNames.length === 1) {
    return (
      <div className="relative w-16 h-12 flex items-center justify-end pr-2">
        <AvatarCapsule name={displayNames[0]} size={size} showEyes={true} />
        {remaining > 0 && (
          <span className="absolute -bottom-1 right-0 px-1.5 py-0.2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-bold">
            +{remaining}
          </span>
        )}
      </div>
    );
  }

  if (displayNames.length === 2) {
    return (
      <div className="relative w-18 h-12 flex items-center justify-end">
        <div className="flex items-center -space-x-2">
          <AvatarCapsule name={displayNames[0]} size={size} showEyes={true} className="z-10 ring-2 ring-[#131926]" />
          <AvatarCapsule name={displayNames[1]} size={size} className="z-20 ring-2 ring-[#131926]" />
        </div>
        {remaining > 0 && (
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-bold z-30">
            +{remaining}
          </span>
        )}
      </div>
    );
  }

  if (displayNames.length === 3) {
    return (
      <div className="relative w-18 h-14 flex items-center justify-end">
        {/* Top pair */}
        <div className="absolute top-0 right-1 flex items-center -space-x-1.5">
          <AvatarCapsule name={displayNames[0]} size={size} className="z-10 ring-2 ring-[#131926]" />
          <AvatarCapsule name={displayNames[1]} size={size} showEyes={true} className="z-20 ring-2 ring-[#131926]" />
        </div>
        {/* Bottom capsule centered under */}
        <div className="absolute bottom-0 right-4 z-30">
          <AvatarCapsule name={displayNames[2]} size={size} className="ring-2 ring-[#131926]" />
        </div>
        {remaining > 0 && (
          <span className="absolute -bottom-1 right-0 px-1.5 py-0.2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-bold z-40">
            +{remaining}
          </span>
        )}
      </div>
    );
  }

  // 4 avatars cluster
  return (
    <div className="relative w-20 h-14 flex items-center justify-end">
      <div className="absolute top-0 right-2 flex items-center -space-x-1.5">
        <AvatarCapsule name={displayNames[0]} size={size} className="z-10 ring-2 ring-[#131926]" />
        <AvatarCapsule name={displayNames[1]} size={size} showEyes={true} className="z-20 ring-2 ring-[#131926]" />
      </div>
      <div className="absolute bottom-0 right-3 flex items-center -space-x-1.5">
        <AvatarCapsule name={displayNames[2]} size={size} className="z-30 ring-2 ring-[#131926]" />
        <AvatarCapsule name={displayNames[3]} size={size} className="z-30 ring-2 ring-[#131926]" />
      </div>
      {remaining > 0 && (
        <span className="absolute -bottom-1 right-0 px-1.5 py-0.2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-bold z-40">
          +{remaining}
        </span>
      )}
    </div>
  );
}
