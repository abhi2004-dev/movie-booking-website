"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TextReveal } from "@/components/ui/TextReveal";

interface Seat {
  id: number;
  row_label: string;
  seat_number: number;
  seat_type: string;
  status: string;
  price: number;
}

interface ShowData {
  show_id: number;
  seats: Seat[];
}

export default function SeatMap() {
  const params = useParams();
  const router = useRouter();
  const showId = params.id as string;

  const [showData, setShowData] = useState<ShowData | null>(null);
  const [myLockedSeats, setMyLockedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSeats = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/shows/${showId}/seats`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch seats");
      const data = await res.json();
      setShowData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(() => {
      fetchSeats();
    }, 2000);
    return () => clearInterval(interval);
  }, [showId]);

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === "booked") {
      alert(`Seat ${seat.row_label}${seat.seat_number} is already booked!`);
      return;
    }

    const isMySeat = myLockedSeats.includes(seat.id);

    if (seat.status === "held" && !isMySeat) {
      alert(`Seat ${seat.row_label}${seat.seat_number} is currently locked by another user.`);
      return;
    }

    if (isMySeat) {
      try {
        await fetch(`http://127.0.0.1:8000/shows/${showId}/seats/${seat.id}/unlock`, { method: "POST" });
        setMyLockedSeats((prev) => prev.filter((id) => id !== seat.id));
        fetchSeats();
      } catch (error) {
        console.error("Failed to unlock seat", error);
      }
      return;
    }

    if (seat.status === "available") {
      try {
        const res = await fetch(`http://127.0.0.1:8000/shows/${showId}/seats/${seat.id}/lock`, { method: "POST" });
        if (!res.ok) {
          alert(`Someone just grabbed Seat ${seat.row_label}${seat.seat_number}!`);
          fetchSeats();
          return;
        }
        setMyLockedSeats((prev) => [...prev, seat.id]);
        fetchSeats();
      } catch (error) {
        console.error("Failed to hold seat", error);
      }
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to book tickets.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    
    // Generate an Idempotency Key natively in the browser to prevent double charges
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("http://127.0.0.1:8000/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Attach JWT for authentication
        },
        body: JSON.stringify({
          show_id: parseInt(showId),
          seat_ids: myLockedSeats,
          idempotency_key: idempotencyKey
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Checkout failed");
      }

      const bookingResult = await res.json();
      alert(`Success! Transaction ID: ${bookingResult.transaction_id}`);
      
      // Clear local locks and redirect to dashboard (or home for now)
      setMyLockedSeats([]);
      router.push("/");
    } catch (err: any) {
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="py-12 text-center">Loading Seat Layout...</div>;
  if (!showData) return <div className="py-12 text-center text-red-500">Failed to load seating chart.</div>;

  const totalPrice = showData.seats
    .filter(seat => myLockedSeats.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 pb-32">
      <TextReveal text={`Seat Selection`} className="text-3xl font-bold text-primary mb-8 text-center" />

      <div className="w-full h-8 bg-gray-200 rounded-t-3xl mb-12 shadow-inner flex items-center justify-center text-sm text-secondary tracking-widest">
        SCREEN
      </div>

      <div className="flex justify-center gap-6 mb-12 text-sm font-medium text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-transparent border-2 border-gray-300 rounded-md"></div> Free
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-accent rounded-md"></div> Selected
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-400 rounded-md"></div> Locked
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-md"></div> Booked
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
        {showData.seats.map((seat) => {
          const isMySeat = myLockedSeats.includes(seat.id);
          let seatClass = "w-10 h-10 flex items-center justify-center rounded-md font-bold text-xs transition-all ";

          if (seat.status === "booked") {
            seatClass += "bg-red-500 text-white cursor-not-allowed shadow-sm";
          } else if (isMySeat) {
            seatClass += "bg-accent text-white shadow-md scale-110";
          } else if (seat.status === "held") {
            seatClass += "bg-gray-400 text-white cursor-not-allowed shadow-sm";
          } else {
            seatClass += "bg-transparent border-2 border-gray-300 text-primary hover:border-accent cursor-pointer";
          }

          return (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              className={seatClass}
              disabled={isProcessing}
              title={`Seat ${seat.row_label}${seat.seat_number} - ₹${seat.price}`}
            >
              {seat.row_label}{seat.seat_number}
            </button>
          );
        })}
      </div>

      {myLockedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-between items-center md:px-32 z-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">{myLockedSeats.length} Seat(s) Selected</span>
            <span className="text-sm text-secondary">Total: ₹{totalPrice.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="px-8 py-3 bg-accent text-white rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Book Tickets"}
          </button>
        </div>
      )}
    </div>
  );
}