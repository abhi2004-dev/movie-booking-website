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
  const showId = params.id;

  const [showData, setShowData] = useState<ShowData | null>(null);
  const [myLockedSeats, setMyLockedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCheckout = () => {
    // For now, just an alert. In the next phases, this will trigger the real payment flow.
    alert(`Proceeding to checkout with ${myLockedSeats.length} seat(s)!`);
    // router.push(`/checkout?show=${showId}&seats=${myLockedSeats.join(",")}`);
  };

  if (loading) return <div className="py-12 text-center">Loading Seat Layout...</div>;
  if (!showData) return <div className="py-12 text-center text-red-500">Failed to load seating chart.</div>;

  // Calculate total price of locked seats
  const totalPrice = showData.seats
    .filter(seat => myLockedSeats.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 pb-32">
      <TextReveal text={`Seat Selection`} className="text-3xl font-bold text-primary mb-8 text-center" />

      {/* Screen Indicator */}
      <div className="w-full h-8 bg-gray-200 rounded-t-3xl mb-12 shadow-inner flex items-center justify-center text-sm text-secondary tracking-widest">
        SCREEN
      </div>

      {/* Visual Legend */}
      <div className="flex justify-center gap-6 mb-12 text-sm font-medium text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-transparent border-2 border-gray-300 rounded-md"></div> Free
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-accent rounded-md"></div> Selected (Your Lock)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-400 rounded-md"></div> Locked (Someone Else)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-md"></div> Booked
        </div>
      </div>

      {/* Seat Grid */}
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
              title={`Seat ${seat.row_label}${seat.seat_number} - ₹${seat.price}`}
            >
              {seat.row_label}{seat.seat_number}
            </button>
          );
        })}
      </div>

      {/* Sticky Action Bar */}
      {myLockedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-between items-center md:px-32 z-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">{myLockedSeats.length} Seat(s) Selected</span>
            <span className="text-sm text-secondary">Total: ₹{totalPrice.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="px-8 py-3 bg-accent text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            Book Tickets
          </button>
        </div>
      )}
    </div>
  );
}