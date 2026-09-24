"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  Ticket as TicketIcon, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Download, 
  Printer, 
  X, 
  QrCode, 
  Sparkles 
} from "lucide-react";

export interface TicketData {
  id: number;
  movie_title: string;
  movie_poster?: string | null;
  movie_genre?: string | null;
  movie_runtime?: number | null;
  theatre_name: string;
  theatre_city: string;
  screen_name: string;
  show_time: string;
  show_date: string;
  seat_names: string;
  total_amount: number;
  status: string;
  transaction_id?: string | null;
}

interface TicketModalProps {
  ticket: TicketData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketModal({ ticket, isOpen, onClose }: TicketModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366F1", "#F59E0B", "#10B981", "#EC4899"],
      });
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 animate-[slideUp_0.25s_ease-out]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-t-3xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="font-bold text-sm tracking-wide">Booking Confirmed & Verified</span>
          </div>
          <span className="text-[11px] font-semibold uppercase bg-black/20 px-2.5 py-0.5 rounded-full">
            Ready to Scan
          </span>
        </div>

        {/* Main Perforated Ticket Card */}
        <div className="ticket-container p-6 sm:p-8 bg-[#12182B] text-white rounded-b-3xl shadow-2xl relative overflow-hidden border border-white/10">
          
          {/* Ticket Perforations */}
          <div className="ticket-notch-left"></div>
          <div className="ticket-notch-right"></div>
          <div className="ticket-divider"></div>

          {/* Top Section: Movie & Poster */}
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
                  <Sparkles className="w-2.5 h-2.5" /> E-Ticket Pass
                </span>
                <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-tight">
                  {ticket.movie_title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {ticket.movie_genre || "Cinema Feature"} • {ticket.movie_runtime || 120} Mins
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{ticket.theatre_name}, {ticket.theatre_city}</span>
              </div>
            </div>
          </div>

          {/* Middle Section: Details Grid */}
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

          {/* Bottom Section: QR Code, Barcode & Transaction ID */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                {/* Visual QR Code Generator */}
                <div className="w-full h-full border-2 border-dashed border-slate-900 flex flex-col items-center justify-center text-slate-900">
                  <QrCode className="w-12 h-12 text-slate-950" />
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Booking Ref</p>
                <p className="text-sm font-mono font-bold text-indigo-300">STAR-{ticket.id.toString().padStart(6, '0')}</p>
                <p className="text-[10px] text-slate-400 mt-1">Txn: {ticket.transaction_id || "TXN-VERIFIED"}</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">Total Paid: ${ticket.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-32 flex items-center justify-between gap-[2px] opacity-75">
                {[4, 2, 6, 1, 8, 3, 5, 2, 7, 3, 1, 6, 4, 8, 2, 5, 3, 6, 2, 4, 7, 3].map((h, i) => (
                  <div key={i} className="bg-white rounded-full w-[2px]" style={{ height: `${h * 10}%` }}></div>
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 tracking-widest">
                984729482749
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
