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
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/80 text-xs font-mono py-2 sm:py-2.5 px-3 sm:px-4 overflow-hidden glass-specular shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold uppercase text-[9px] sm:text-[10px] border border-teal-200 shrink-0">
              <span className="radar-ring h-1.5 w-1.5 rounded-full bg-teal-500" />
              LIVE CONCOURSE
            </span>
            <div className="hidden sm:flex items-center gap-3 text-slate-600 transition-all duration-300 truncate">
              <span className="text-slate-400">[{activeDeparture.platform}]</span>
              <span className="text-slate-900 font-bold">{activeDeparture.station}</span>
              <span className="text-teal-700 font-medium">({activeDeparture.line})</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-semibold">{activeDeparture.status}</span>
            </div>
            <div className="sm:hidden text-teal-700 font-semibold text-[11px] truncate">
              {activeDeparture.station} — {activeDeparture.status}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-[11px] shrink-0 font-mono">
            <span>ENGINE:</span>
            <span className="text-slate-700 font-bold">48kHz OPUS SFU</span>
            <span className="text-emerald-600 font-semibold">● ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main SaaS Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-14 md:py-16 text-center my-auto relative z-10 w-full">
        {/* Anonymity & Freedom Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-teal-800 text-[10px] sm:text-xs font-mono font-semibold mb-6 sm:mb-8 shadow-sm max-w-full truncate border border-teal-200/90 bg-white">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
          <span className="truncate">100% ANONYMOUS SOCIAL AUDIO • ZERO LOGINS • NO TRACE</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">26 HUBS LIVE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-4 sm:mb-6 leading-[1.12]">
          Talk Freely. Stay Anonymous. <br />
          <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Vibe Without Judgment.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2">
          Step into any railway station voice lounge to talk about your day, share a laugh, debate late-night thoughts, or just listen in peace. <strong className="text-slate-900 font-bold">No accounts, no phone numbers, and no profiles</strong> — just real human voices.
        </p>

        {/* Primary Call to Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/connect"
            className="w-full sm:w-auto px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2.5 group focus:outline-none focus:ring-4 focus:ring-indigo-400/40 active:scale-95"
          >
            <span>🎲 1:1 Random Connect</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/80 text-white border border-indigo-400/50">
              Skip ⏭
            </span>
          </Link>

          <Link
            href="/stations"
            className="w-full sm:w-auto px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(13,148,136,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2 group focus:outline-none focus:ring-4 focus:ring-teal-400/40 active:scale-95"
          >
            <span>Explore 26 Stations</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-base">
              ➔
            </span>
          </Link>
        </div>

        {/* How It Works - 3 Easy Steps */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] text-left glass-specular">
          <div className="text-center max-w-md mx-auto mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full font-bold">
              HOW IT WORKS
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-950 mt-2 tracking-tight">
              3 Steps to Start Talking in 10 Seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">Pick Any Station</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Browse 26 railway platform voice lounges across South, North, East, West, and Central India.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">Get Your Handle</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Choose Male or Female style once. You immediately get a random Indian traveler moniker.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">Unmute & Talk</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Unmute your mic whenever you want to speak. When your 15m journey ends, you leave without a trace.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
