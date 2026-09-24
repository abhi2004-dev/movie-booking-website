"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextReveal } from "@/components/ui/TextReveal";

interface SeatDetail {
  row_label: string;
  seat_number: number;
}

interface BookingHistory {
  id: number;
  movie_title: string;
  theatre_name: string;
  screen_name: string;
  show_time: string;
  total_amount: number;
  status: string;
  seats: SeatDetail[];
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signup");
    } else {
      setIsAuthorized(true);
      setIsChecking(false);
      fetchMyBookings(token);
    }
  }, [router]);

  const fetchMyBookings = async (token: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/bookings/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signup");
  };

  if (isChecking) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-gray-600">Checking authentication...</h2>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <TextReveal text="My Dashboard" className="text-3xl font-bold text-gray-900" />
        <button 
          onClick={handleLogout}
          className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-colors"
        >
          Log Out
        </button>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticket History</h2>
        
        {loadingBookings ? (
          <p className="text-gray-600 text-center py-8">Loading your tickets...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">You haven't booked any tickets yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map((booking) => {
              const showDate = new Date(booking.show_time);
              const formattedDate = showDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const formattedTime = showDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const seatsDisplay = booking.seats.map(s => `${s.row_label}${s.seat_number}`).join(', ');

              return (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{booking.movie_title}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium text-gray-900">{booking.theatre_name}</span> • {booking.screen_name}
                    </p>
                    <p className="text-gray-600 mb-3">
                      {formattedDate} at {formattedTime}
                    </p>
                    <p className="text-sm font-medium text-purple-700 bg-purple-100 w-fit px-3 py-1 rounded-md">
                      Seats: {seatsDisplay}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-left md:text-right mb-4 md:mb-0">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{booking.total_amount.toFixed(2)}</p>
                    </div>
                    <p className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      TXN_ID: txn_{booking.id.toString().padStart(8, '0')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}