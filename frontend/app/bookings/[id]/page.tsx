"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  QrCode, 
  Printer, 
  Sparkles, 
  Ticket as TicketIcon 
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function BookingPassPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(getApiUrl(`/bookings/${bookingId}`));
        if (res && res.ok) {
          const data = await res.json();
          setTicket(data);
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#6366F1", "#F59E0B", "#10B981"],
          });
        }
      } catch (e) {
        console.error("Failed to load booking pass:", e);
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) loadTicket();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Verifying digital pass...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ticket Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">Could not find booking reference #{bookingId}.</p>
        <Link href="/" className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-xl mx-auto px-4 sm:px-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Bookings</span>
      </Link>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3.5 rounded-t-3xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-bold text-sm">Official Cinema Pass</span>
        </div>
        <span className="text-[10px] font-bold uppercase bg-black/20 px-2.5 py-0.5 rounded-full">
          Confirmed
        </span>
      </div>

      {/* Perforated Ticket Pass */}
      <div className="ticket-container p-6 sm:p-8 bg-[#12182B] text-white rounded-b-3xl shadow-2xl relative overflow-hidden border border-white/10">
        <div className="ticket-notch-left"></div>
        <div className="ticket-notch-right"></div>
        <div className="ticket-divider"></div>

        {/* Top Section */}
        <div className="flex gap-5 pb-8">
          <img
            src={
              ticket.movie_poster && (ticket.movie_poster.startsWith("/") || ticket.movie_poster.startsWith("http"))
                ? ticket.movie_poster
                : "/posters/sonic_3.jpg"
            }
            alt={ticket.movie_title}
            onError={(e) => {
              e.currentTarget.src = "/posters/sonic_3.jpg";
            }}
            className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
          />

          <div className="flex flex-col justify-between py-1">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-2.5 h-2.5" /> Verified Pass
              </span>
              <h1 className="font-extrabold text-2xl text-white tracking-tight leading-tight">
                {ticket.movie_title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {ticket.movie_genre || "Feature"} • {ticket.movie_runtime || 120} Mins
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{ticket.theatre_name}, {ticket.theatre_city}</span>
            </div>
          </div>
        </div>

        {/* Middle Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-t border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Date
            </p>
            <p className="text-xs font-bold text-white mt-1">{ticket.show_date}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" /> Time
            </p>
            <p className="text-xs font-bold text-white mt-1">{ticket.show_time}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Screen</p>
            <p className="text-xs font-bold text-indigo-300 mt-1">{ticket.screen_name}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Seats</p>
            <p className="text-xs font-extrabold text-amber-400 mt-1 bg-amber-400/10 px-2 py-0.5 rounded-md inline-block">
              {ticket.seat_names}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Booking Ref</p>
              <p className="text-sm font-mono font-bold text-indigo-300">STAR-{ticket.id.toString().padStart(6, '0')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Txn: {ticket.transaction_id || "TXN-OK"}</p>
              <p className="text-xs font-bold text-emerald-400 mt-1">Paid: ${ticket.total_amount.toFixed(2)}</p>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex flex-col items-center">
            <div className="h-10 w-32 flex items-center justify-between gap-[2px] opacity-75">
              {[5, 2, 7, 1, 8, 3, 6, 2, 7, 4, 1, 6, 4, 8, 2, 5, 3, 6, 2, 4, 7, 3].map((h, i) => (
                <div key={i} className="bg-white rounded-full w-[2px]" style={{ height: `${h * 10}%` }}></div>
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 tracking-widest">
              847294827492
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Explore More Movies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
