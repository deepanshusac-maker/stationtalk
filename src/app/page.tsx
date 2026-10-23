'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEPARTURES = [
  { line: 'CENTRAL LINE', platform: 'PF 01', station: 'Delhi Central', status: 'BROADCASTING', time: 'LIVE' },
  { line: 'WEST EXPRESS', platform: 'PF 04', station: 'Mumbai Central', status: 'OPEN MIC', time: 'LIVE' },
  { line: 'EAST CORRIDOR', platform: 'PF 07', station: 'Patna Junction', status: 'STAGE ACTIVE', time: 'LIVE' },
  { line: 'SOUTH TERMINUS', platform: 'PF 10', station: 'Chennai Central', status: 'DISCUSSIONS', time: 'LIVE' },
  { line: 'NORTH LINE', platform: 'PF 13', station: 'Amritsar Junction', status: 'MORNING CHATS', time: 'LIVE' },
];

export default function ArrivalScreen() {
  const [boardIndex, setBoardIndex] = useState(0);

  // Cycle the split-flap departure board ticker every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBoardIndex((prev) => (prev + 1) % DEPARTURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeDeparture = DEPARTURES[boardIndex];

  return (
    <div className="flex-1 flex flex-col justify-between bg-concourse-pattern">
      {/* Top Split-Flap Railway Departure Ticker */}
      <div className="bg-gray-900/90 border-b border-gray-800 text-xs font-mono py-2.5 px-4 overflow-hidden shadow-inner">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold tracking-wider uppercase text-[10px] border border-amber-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              DEPARTURE BOARD
            </span>
            <div className="hidden sm:flex items-center gap-3 text-gray-300 transition-all duration-300">
              <span className="text-gray-500">[{activeDeparture.platform}]</span>
              <span className="text-white font-semibold">{activeDeparture.station}</span>
              <span className="text-amber-400 font-medium">({activeDeparture.line})</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">{activeDeparture.status}</span>
            </div>
            <div className="sm:hidden text-amber-400 font-medium truncate">
              {activeDeparture.station} — {activeDeparture.status}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-500">
            <span>TERMINAL FREQ:</span>
            <span className="text-gray-300 font-bold">48kHz OPUS</span>
            <span className="text-emerald-400">● LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Hero Screen */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-20 lg:py-24 text-center my-auto">
        {/* Terminal Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gray-900/90 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-8 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>STATION-BASED GROUP VOICE ROOMS</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">POWERED BY LIVEKIT SFU</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          Step Onto the <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Audio Platform.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Welcome to <strong className="text-gray-200">StationTalk</strong> — a live social audio concourse
          divided into regional railway lines. Drop into any station, listen in crisp WebRTC voice,
          and take the microphone when you want to speak.
        </p>

        {/* Primary CTA to Screen 2 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/stations"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 text-gray-950 font-bold text-base hover:bg-amber-400 transition-all duration-200 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-amber-400/50"
          >
            <span>Enter Station Concourse</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-lg">
              ➔
            </span>
          </Link>

          <Link
            href="/room/delhi-central"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gray-900 border border-gray-700/80 text-gray-200 font-semibold text-base hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Quick Board: Delhi Central</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-amber-300 font-mono">
              PF 01
            </span>
          </Link>
        </div>

        {/* Live Audio Visualizer Banner */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm flex items-center justify-between gap-4 mb-16">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-amber-400 rounded-full wave-bar-1" />
              <span className="w-1 bg-amber-400 rounded-full wave-bar-2" />
              <span className="w-1 bg-amber-400 rounded-full wave-bar-3" />
              <span className="w-1 bg-amber-400 rounded-full wave-bar-4" />
              <span className="w-1 bg-amber-400 rounded-full wave-bar-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Live Voice Concourse Ready</div>
              <div className="text-[11px] text-gray-400">12 Verified Stations • 5 Regional Lines</div>
            </div>
          </div>
          <Link
            href="/stations"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            View All Rooms →
          </Link>
        </div>

        {/* 3 Pillars / Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800/80 hover:border-gray-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
              🧭
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5 Regional Lines</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Travel across North, South, East, West, and Central hubs. Every station offers a unique group atmosphere and focus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800/80 hover:border-gray-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 border border-amber-500/20">
              🎧
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Listener-First Design</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Join quietly without any pressure. Default permissions keep you as a listener until you&apos;re ready to request the mic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800/80 hover:border-gray-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 border border-emerald-500/20">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real SFU Voice Mesh</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              No simulated or fake audio. Powered by LiveKit Cloud for sub-100ms real WebRTC voice capture and high-fidelity playback.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/80 py-6 px-4 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🚉 StationTalk MVP</span>
            <span>•</span>
            <span className="text-gray-400">Phase 1: Real-Time Group Voice</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/stations" className="hover:text-amber-400 transition-colors">
              Concourse Directory
            </Link>
            <span>•</span>
            <span>LiveKit Cloud SFU</span>
            <span>•</span>
            <span>Next.js App Router</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
