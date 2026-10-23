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
    <div className="flex-1 flex flex-col justify-between bg-[#0b0f17]">
      {/* Top Clean Departure Ticker */}
      <div className="bg-[#0e1420] border-b border-[#1b2333] text-xs font-mono py-2.5 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 font-bold uppercase text-[10px] border border-teal-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
              LIVE CONCOURSE
            </span>
            <div className="hidden sm:flex items-center gap-3 text-gray-300 transition-all duration-300">
              <span className="text-gray-500">[{activeDeparture.platform}]</span>
              <span className="text-white font-semibold">{activeDeparture.station}</span>
              <span className="text-teal-400 font-medium">({activeDeparture.line})</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">{activeDeparture.status}</span>
            </div>
            <div className="sm:hidden text-teal-300 font-medium truncate">
              {activeDeparture.station} — {activeDeparture.status}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-500">
            <span>NETWORK:</span>
            <span className="text-gray-300 font-bold">48kHz OPUS</span>
            <span className="text-emerald-400">● LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Hero Screen */}
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20 text-center my-auto">
        {/* Terminal Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131926] border border-[#232f44] text-teal-300 text-xs font-mono font-medium mb-8 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span>STATION-BASED GROUP VOICE ROOMS</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">LIVEKIT SFU</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Step Onto the <br />
          <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Audio Platform.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Welcome to <strong className="text-white">StationTalk</strong> — a live social audio concourse.
          Drop into any station room, listen in crisp real-time WebRTC audio, and take the microphone when you want to speak.
        </p>

        {/* Primary CTA to Screen 2 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/stations"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-500 text-gray-950 font-bold text-sm hover:bg-teal-400 transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-teal-400/40"
          >
            <span>Enter Station Concourse</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-base">
              ➔
            </span>
          </Link>

          <Link
            href="/room/coimbatore-junction"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#131926] border border-[#212b3c] text-gray-200 font-semibold text-sm hover:bg-[#1a2334] hover:text-white hover:border-[#2f3d56] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Quick Board: Coimbatore Junction</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1e2738] text-teal-300 font-mono">
              PF 01
            </span>
          </Link>
        </div>

        {/* 3 Simple Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-[#131926] border border-[#212b3c] hover:border-[#2f3d56] transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-xl mb-3 border border-teal-500/20">
              🧭
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">5 Regional Lines</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore stations across South, North, East, West, and Central hubs with local flavor and community topics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131926] border border-[#212b3c] hover:border-[#2f3d56] transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-3 border border-purple-500/20">
              🎧
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Listener-First Stage</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Join quietly with zero microphone friction. When you want to share your thoughts, tap the mic to join up to 7 stage speakers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131926] border border-[#212b3c] hover:border-[#2f3d56] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-3 border border-emerald-500/20">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Real LiveKit WebRTC</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by LiveKit Cloud SFU. Crystal-clear Opus audio with ultra-low latency and zero simulated sound.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
