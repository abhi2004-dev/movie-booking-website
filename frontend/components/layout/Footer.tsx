"use client";

import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, Database, Cpu, Lock, Heart, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#080B12] border-t border-white/[0.06] mt-24 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Architecture Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#101424] border border-indigo-500/20 p-8 mb-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Concurrency Architecture</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Engineered for High-Concurrency Ticket Surges
              </h3>
              <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
                Starpass utilizes a two-tier defense: sub-millisecond distributed Redis lock gates coupled with PostgreSQL ACID row-level locking (<code className="text-indigo-300 text-xs">SELECT ... FOR UPDATE</code>) guaranteeing zero double-bookings under peak traffic.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Lock Gate</p>
                  <p className="text-xs font-bold text-white">Redis 300s TTL</p>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Persistence</p>
                  <p className="text-xs font-bold text-white">PostgreSQL ACID</p>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Payment</p>
                  <p className="text-xs font-bold text-white">UUID Idempotency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 p-[1.5px]">
                <div className="w-full h-full bg-[#0A0D15] rounded-[9px] flex items-center justify-center">
                  <Film className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white lowercase">
                starpass
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Premium movie ticketing platform demonstrating full-stack engineering depth, concurrency safety, and modern entertainment design.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Code2 className="w-4 h-4 text-indigo-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Now Showing</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">My Tickets & Passes</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">VIP Member Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Experience Types */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Formats & Venues</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>IMAX with Laser 3D</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Dolby Cinema Atmos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>VIP Recliner Lounges</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Built With</h4>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">Next.js 15 (App Router)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">FastAPI</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">PostgreSQL</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">Redis TTL Locks</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">Tailwind CSS 4</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">TypeScript</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Starpass Cinema Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for high-concurrency placement excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
