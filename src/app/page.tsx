'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEPARTURES = [
  { line: 'SOUTH LINE', platform: 'PF 01', station: 'Coimbatore Junction', status: 'BROADCASTING' },
  { line: 'WEST LINE', platform: 'PF 04', station: 'Mumbai Central', status: 'OPEN MIC' },
  { line: 'EAST LINE', platform: 'PF 07', station: 'Patna Junction', status: 'STAGE ACTIVE' },
  { line: 'SOUTH LINE', platform: 'PF 10', station: 'Bengaluru City', status: 'DISCUSSIONS' },
  { line: 'NORTH LINE', platform: 'PF 13', station: 'Prayagraj Junction', status: 'LIVE STAGE' },
];

export default function ArrivalScreen() {
  const [boardIndex, setBoardIndex] = useState(0);

  // Cycle the departure ticker every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBoardIndex((prev) => (prev + 1) % DEPARTURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeDeparture = DEPARTURES[boardIndex];

  return (
    <div className="flex-1 flex flex-col justify-between saas-mesh-bg saas-dots-pattern relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      {/* Top Glass Departure Ticker */}
      <div className="bg-[#07090e]/60 backdrop-blur-xl border-b border-white/[0.06] text-xs font-mono py-2 sm:py-2.5 px-3 sm:px-4 overflow-hidden glass-specular">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold uppercase text-[9px] sm:text-[10px] border border-teal-500/25 shrink-0">
              <span className="radar-ring h-1.5 w-1.5 rounded-full bg-teal-400" />
              LIVE CONCOURSE
            </span>
            <div className="hidden sm:flex items-center gap-3 text-gray-300 transition-all duration-300 truncate">
              <span className="text-gray-500">[{activeDeparture.platform}]</span>
              <span className="text-white font-semibold">{activeDeparture.station}</span>
              <span className="text-teal-400 font-medium">({activeDeparture.line})</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400 font-medium">{activeDeparture.status}</span>
            </div>
            <div className="sm:hidden text-teal-300 font-medium text-[11px] truncate">
              {activeDeparture.station} — {activeDeparture.status}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-500 text-[11px] shrink-0">
            <span>ENGINE:</span>
            <span className="text-gray-300 font-bold">48kHz OPUS SFU</span>
            <span className="text-emerald-400 font-medium">● ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main SaaS Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-16 md:py-20 text-center my-auto relative z-10 w-full">
        {/* Terminal Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full glass-pill text-teal-300 text-[10px] sm:text-xs font-mono font-medium mb-6 sm:mb-8 shadow-sm max-w-full truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <span className="truncate">STATION-BASED GROUP VOICE ROOMS</span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="text-gray-400 hidden sm:inline">LIVEKIT CLOUD SFU</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.12]">
          Step Onto the <br />
          <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            Audio Platform.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2">
          Welcome to <strong className="text-white">StationTalk</strong> — a modern social audio network.
          Drop into any station room, listen in crystal-clear WebRTC audio, and step up to the microphone with complete anonymous privacy.
        </p>

        {/* Primary Call to Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/stations"
            className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold text-sm transition-all duration-200 shadow-[0_0_30px_rgba(20,184,166,0.35)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] hover:scale-[1.02] flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-teal-400/40 active:scale-95"
          >
            <span>Explore All 26 Platforms</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-base">
              ➔
            </span>
          </Link>

          <Link
            href="/room/coimbatore-junction"
            className="w-full sm:w-auto px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl glass-panel-interactive text-gray-200 font-semibold text-sm hover:text-white flex items-center justify-center gap-2.5 active:scale-95"
          >
            <span>Quick Board: Coimbatore Junction</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-teal-300 font-mono border border-white/[0.08]">
              PF 01
            </span>
          </Link>
        </div>

        {/* 3 World-Class SaaS Feature Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 text-left">
          <div className="p-5 sm:p-6 rounded-3xl glass-panel-interactive glass-specular">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 flex items-center justify-center text-xl mb-3 sm:mb-4 border border-teal-500/20 shadow-inner">
              🧭
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2 tracking-tight">26 Regional Hubs</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Travel across South, North, East, West, and Central corridors. Each station hosts a distinct regional vibe and open discussions.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl glass-panel-interactive glass-specular">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 flex items-center justify-center text-xl mb-3 sm:mb-4 border border-indigo-500/20 shadow-inner">
              🎭
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2 tracking-tight">Anonymous Personas</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No sign-up or real names required. Express yourself freely with auto-generated transit monikers and 1-click 🎲 identity re-rolling.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl glass-panel-interactive glass-specular">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 flex items-center justify-center text-xl mb-3 sm:mb-4 border border-emerald-500/20 shadow-inner">
              ⚡
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2 tracking-tight">Sub-100ms SFU Mesh</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by LiveKit Cloud. High-fidelity Opus audio, server-governed 7-speaker cap, and support for hundreds of simultaneous listeners.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
