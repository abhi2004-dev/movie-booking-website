import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

// ─── GET SOCKET SINGLETON ─────────────────────────────────────────────────────
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io('/', {
      transports:       ['websocket', 'polling'],
      reconnection:     true,
      reconnectionDelay:1000,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
const useSocket = (showtimeId, { onSeatsLocked, onSeatsUnlocked, onSeatsConfirmed } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!showtimeId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Join the showtime room
    socket.emit('join_showtime', { showtimeId });

    // ─── LISTENERS ──────────────────────────────────────────────────────────

    // Another user locked seats
    const handleLocked = (data) => {
      if (data.showtime_id === showtimeId && onSeatsLocked) {
        onSeatsLocked(data.seats);
      }
    };

    // Seats released (user went back or disconnected)
    const handleUnlocked = (data) => {
      if (data.showtime_id === showtimeId && onSeatsUnlocked) {
        onSeatsUnlocked(data.seats);
      }
    };

    // Payment confirmed — seats permanently booked
    const handleConfirmed = (data) => {
      if (data.showtime_id === showtimeId && onSeatsConfirmed) {
        onSeatsConfirmed(data.seats);
      }
    };

    // Current locked seats sent on join
    const handleCurrentLocked = (data) => {
      if (data.showtime_id === showtimeId && onSeatsLocked) {
        onSeatsLocked(data.locked_seats);
      }
    };

    socket.on('seats_locked',         handleLocked);
    socket.on('seats_unlocked',       handleUnlocked);
    socket.on('seats_confirmed',      handleConfirmed);
    socket.on('current_locked_seats', handleCurrentLocked);

    // ─── CLEANUP ────────────────────────────────────────────────────────────
    return () => {
      socket.emit('leave_showtime', { showtimeId });
      socket.off('seats_locked',         handleLocked);
      socket.off('seats_unlocked',       handleUnlocked);
      socket.off('seats_confirmed',      handleConfirmed);
      socket.off('current_locked_seats', handleCurrentLocked);
    };
  }, [showtimeId]);

  // ─── EMIT HELPERS ─────────────────────────────────────────────────────────

  const lockSeats = useCallback((seatCodes, userId) => {
    if (socketRef.current) {
      socketRef.current.emit('lock_seats', { showtimeId, seatCodes, userId });
    }
  }, [showtimeId]);

  const unlockSeats = useCallback((seatCodes) => {
    if (socketRef.current) {
      socketRef.current.emit('unlock_seats', { showtimeId, seatCodes });
    }
  }, [showtimeId]);

  const confirmSeats = useCallback((seatCodes) => {
    if (socketRef.current) {
      socketRef.current.emit('confirm_seats', { showtimeId, seatCodes });
    }
  }, [showtimeId]);

  const isConnected = () => socketRef.current?.connected || false;

  return {
    lockSeats,
    unlockSeats,
    confirmSeats,
    isConnected,
    socket: socketRef.current,
  };
};

export default useSocket;