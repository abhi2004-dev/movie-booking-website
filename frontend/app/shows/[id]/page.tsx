"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { TicketModal, TicketData } from "@/components/ticket/TicketModal";
import { getApiUrl } from "@/lib/api";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Tv, 
  Check, 
  Lock, 
  AlertCircle,
  Armchair,
  Info
} from "lucide-react";

interface Seat {
  id: number;
  row_label: string;
  seat_number: number;
  seat_type: string;
  status: "available" | "held" | "booked";
  price: number;
}

interface ShowSeatData {
  show_id: number;
  movie_title?: string;
  theatre_name?: string;
  screen_name?: string;
  show_time?: string;
  show_date?: string;
  seats: Seat[];
}

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const showId = params.id as string;
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [showData, setShowData] = useState<ShowSeatData | null>(null);
  const [myLockedSeats, setMyLockedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 5-Minute (300s) Hold Countdown Timer
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(300);
  const [timerActive, setTimerActive] = useState(false);

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<TicketData | null>(null);

  // Generated idempotency key per selection session
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, [showId]);

  const fetchSeats = async () => {
    try {
      const res = await fetch(getApiUrl(`/shows/${showId}/seats`), { cache: "no-store" });
      if (res && res.ok) {
        const data = await res.json();
        setShowData(data);
      }
    } catch (error) {
      console.error("Error fetching seat map:", error);
    } finally {
      setLoading(false);
    }
  };

  // Poll seats every 2.5s for real-time concurrency visibility
  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 2500);
    return () => clearInterval(interval);
  }, [showId]);

  // Hold Countdown Timer effect
  useEffect(() => {
    if (myLockedSeats.length > 0 && !timerActive) {
      setTimerActive(true);
      setHoldTimeRemaining(300);
    } else if (myLockedSeats.length === 0) {
      setTimerActive(false);
    }
  }, [myLockedSeats.length, timerActive]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setHoldTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired: release locks
          handleTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleTimerExpired = async () => {
    setTimerActive(false);
    showToast("Seat hold session expired (5 minutes). Releasing locks.", "error");
    if (myLockedSeats.length > 0) {
      try {
        await fetch(getApiUrl(`/shows/${showId}/seats/release`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seat_ids: myLockedSeats }),
        });
      } catch (e) {
        console.warn("Release hold error:", e);
      }
      setMyLockedSeats([]);
      fetchSeats();
    }
  };

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === "booked") {
      showToast(`Seat ${seat.row_label}${seat.seat_number} is already booked.`, "error");
      return;
    }

    const isMySeat = myLockedSeats.includes(seat.id);

    // If locked by another user
    if (seat.status === "held" && !isMySeat) {
      showToast(`Seat ${seat.row_label}${seat.seat_number} is currently locked by another user.`, "error");
      return;
    }

    // Toggle: Unlock if already selected by this user
    if (isMySeat) {
      try {
        await fetch(getApiUrl(`/shows/${showId}/seats/${seat.id}/unlock`), { method: "POST" });
        setMyLockedSeats((prev) => prev.filter((id) => id !== seat.id));
        showToast(`Deselected Seat ${seat.row_label}${seat.seat_number}`, "info");
        fetchSeats();
      } catch (error) {
        console.error("Unlock error:", error);
      }
      return;
    }

    // Lock seat via backend concurrency hold
    if (seat.status === "available") {
      try {
        const res = await fetch(getApiUrl(`/shows/${showId}/seats/${seat.id}/lock`), { method: "POST" });
        if (!res || !res.ok) {
          const err = res ? await res.json() : {};
          showToast(err.detail || "Someone just reserved this seat!", "error");
          fetchSeats();
          return;
        }

        setMyLockedSeats((prev) => [...prev, seat.id]);
        showToast(`Locked Seat ${seat.row_label}${seat.seat_number} (5 min reservation)`, "success");
        fetchSeats();
      } catch (error) {
        console.error("Lock error:", error);
        showToast("Failed to hold seat. Please retry.", "error");
      }
    }
  };

  const startCheckout = () => {
    if (!isAuthenticated || !token) {
      showToast("Please log in to confirm your booking.", "info");
      router.push("/login");
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(getApiUrl("/bookings/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          show_id: parseInt(showId),
          seat_ids: myLockedSeats,
          idempotency_key: idempotencyKey,
        }),
      });

      if (!res || !res.ok) {
        const err = res ? await res.json() : {};
        throw new Error(err.detail || "Checkout verification failed");
      }

      const bookingResult = await res.json();
      setPaymentModalOpen(false);

      // Fetch full ticket details to display digital pass (now with Auth header)
      const ticketRes = await fetch(getApiUrl(`/bookings/${bookingResult.id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (ticketRes && ticketRes.ok) {
        const ticketData = await ticketRes.json();
        setConfirmedTicket(ticketData);
      } else {
        setConfirmedTicket({
          id: bookingResult.id,
          movie_title: showData?.movie_title || "Cinema Feature",
          theatre_name: showData?.theatre_name || "Starpass Cinema",
          theatre_city: "Metro",
          screen_name: showData?.screen_name || "Screen 1",
          show_time: showData?.show_time || "Showtime",
          show_date: showData?.show_date || "Today",
          seat_names: selectedSeats.map((s) => `${s.row_label}${s.seat_number}`).join(", "),
          total_amount: bookingResult.total_amount,
          status: "confirmed",
          transaction_id: transactionId,
        });
      }

      setMyLockedSeats([]);
      setTimerActive(false);
      setTicketModalOpen(true);
      showToast("🎉 Booking Confirmed Successfully!", "success");
      fetchSeats();
    } catch (err: any) {
      showToast(`Booking Failed: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = async (errorMessage: string) => {
    setPaymentModalOpen(false);
    showToast(`Payment Failed: ${errorMessage}. Releasing seat locks.`, "error");

    // Release held seats on failure
    try {
      await fetch(getApiUrl(`/shows/${showId}/seats/release`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seat_ids: myLockedSeats }),
      });
    } catch (e) {
      console.warn("Release error:", e);
    }

    setMyLockedSeats([]);
    setTimerActive(false);
    fetchSeats();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Rendering Real-Time Cinema Seat Map...</p>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Show Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">Could not load seating arrangement.</p>
        <Link href="/" className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Selected seats details
  const selectedSeats = showData.seats.filter((s) => myLockedSeats.includes(s.id));
  const subtotalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const seatLabelsString = selectedSeats.map((s) => `${s.row_label}${s.seat_number}`).join(", ");

  // Group seats by row for natural tier rendering
  const seatsByRow: { [key: string]: Seat[] } = {};
  showData.seats.forEach((seat) => {
    if (!seatsByRow[seat.row_label]) {
      seatsByRow[seat.row_label] = [];
    }
    seatsByRow[seat.row_label].push(seat);
  });

  const rowKeys = Object.keys(seatsByRow).sort();

  // Format timer MM:SS
  const timerMins = Math.floor(holdTimeRemaining / 60);
  const timerSecs = holdTimeRemaining % 60;
  const timerString = `${timerMins}:${timerSecs < 10 ? "0" : ""}${timerSecs}`;
  const timerPercent = (holdTimeRemaining / 300) * 100;

  return (
    <div className="pb-44 pt-6">
      
      {/* 1. Header Information */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Movies</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                {showData.screen_name || "Screen 1"}
              </span>
              <span className="text-xs text-slate-400">
                {showData.show_date} • {showData.show_time}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {showData.movie_title || "Movie Show"}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {showData.theatre_name || "Starpass Cinema"}
            </p>
          </div>

          {/* Live Lock Timer Badge */}
          {timerActive && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 animate-pulse-slow">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Seats Held For</p>
                <p className="text-base font-extrabold text-white font-mono leading-tight">{timerString}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Seating Legend */}
      <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 mb-10 text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border border-white/20 bg-white/[0.04]"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/40 border border-indigo-400 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-indigo-300 font-bold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-amber-300">Held by User</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#141A2B] border border-white/5 opacity-50"></div>
          <span className="text-slate-500">Booked</span>
        </div>
      </div>

      {/* 3. 3D Cinema Curved Screen Graphic */}
      <div className="max-w-2xl mx-auto px-4 mb-16 text-center">
        <div className="relative h-12 flex items-center justify-center">
          {/* Ambient Screen Light Bloom */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-16 cinema-screen-glow"></div>
          
          {/* Curved Screen Curve Line */}
          <div className="w-full h-3 border-t-4 border-indigo-500/80 rounded-t-[100%] shadow-[0_-8px_25px_rgba(99,102,241,0.5)]"></div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-slate-400 -mt-2">
          All Eyes This Way • Cinema Screen
        </p>
      </div>

      {/* 4. Interactive Tiered Seat Map */}
      <div className="max-w-4xl mx-auto px-4 overflow-x-auto pb-6">
        <div className="min-w-[620px] flex flex-col gap-3.5 items-center">
          
          {rowKeys.map((rowLabel) => {
            const rowSeats = seatsByRow[rowLabel];
            const isRecliner = rowLabel === "A";
            const isPremium = rowLabel === "B" || rowLabel === "C";
            const tierTitle = isRecliner ? "VIP Recliner ($250)" : isPremium ? "Club Tier ($200)" : "Classic ($150)";

            return (
              <React.Fragment key={rowLabel}>
                {/* Tier Category Heading divider */}
                {(rowLabel === "A" || rowLabel === "B" || rowLabel === "D") && (
                  <div className="w-full max-w-xl flex items-center gap-3 pt-4 pb-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                    <span className="text-[11px] text-indigo-300 flex items-center gap-1">
                      {isRecliner && <Armchair className="w-3.5 h-3.5 text-amber-400" />}
                      {tierTitle}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                  </div>
                )}

                {/* Seat Row */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Row Letter */}
                  <span className="w-6 text-center font-extrabold text-xs text-slate-400">
                    {rowLabel}
                  </span>

                  {/* Seat Buttons in Row */}
                  <div className="flex items-center gap-2">
                    {rowSeats.map((seat, seatIdx) => {
                      const isMySeat = myLockedSeats.includes(seat.id);
                      let btnStyle = "w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center select-none ";

                      if (seat.status === "booked") {
                        btnStyle += "bg-[#141A2E] text-slate-600 border border-white/5 cursor-not-allowed opacity-40";
                      } else if (isMySeat) {
                        btnStyle += "bg-indigo-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/50 scale-110";
                      } else if (seat.status === "held") {
                        btnStyle += "bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed animate-pulse";
                      } else {
                        btnStyle += "bg-white/[0.04] hover:bg-indigo-600/30 text-slate-200 hover:text-white border border-white/[0.08] hover:border-indigo-400 hover:scale-105 cursor-pointer";
                      }

                      return (
                        <React.Fragment key={seat.id}>
                          {/* Aisle Gap between seat 5 and 6 */}
                          {seatIdx === 5 && <div className="w-4 sm:w-6"></div>}

                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={isProcessing}
                            className={btnStyle}
                            title={`Seat ${seat.row_label}${seat.seat_number} • $${seat.price}`}
                          >
                            {isMySeat ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : seat.status === "held" ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              `${seat.row_label}${seat.seat_number}`
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Letter right */}
                  <span className="w-6 text-center font-extrabold text-xs text-slate-400">
                    {rowLabel}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Bottom Checkout Bar */}
      {myLockedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 p-4 sm:p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] animate-[slideUp_0.2s_ease-out]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left Info: Selected seats & Countdown */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Armchair className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white">
                    {myLockedSeats.length} Seat(s) Reserved:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 text-xs font-bold font-mono">
                    {seatLabelsString}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Hold expires in <span className="font-mono text-amber-400 font-bold">{timerString}</span>
                </p>
              </div>
            </div>

            {/* Right Action: Total & Checkout CTA */}
            <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Subtotal</p>
                <p className="text-xl font-black text-emerald-400 leading-tight">
                  ${subtotalPrice.toFixed(2)}
                </p>
              </div>

              <button
                onClick={startCheckout}
                disabled={isProcessing}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <span>Proceed to Pay</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        totalAmount={subtotalPrice}
        seatCount={myLockedSeats.length}
        movieTitle={showData.movie_title || "Cinema Show"}
        showTime={`${showData.show_date} • ${showData.show_time}`}
        seatLabels={seatLabelsString}
        idempotencyKey={idempotencyKey}
      />

      {/* 7. Ticket Confirmation Pass Modal */}
      <TicketModal
        isOpen={ticketModalOpen}
        onClose={() => {
          setTicketModalOpen(false);
          router.push("/profile");
        }}
        ticket={confirmedTicket}
      />
    </div>
  );
}