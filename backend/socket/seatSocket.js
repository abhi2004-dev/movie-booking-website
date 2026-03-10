const { lockSeat, unlockSeat, getLockedSeats, isSeatLocked } = require('../config/redis');

const initSeatSocket = (io) => {

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── JOIN SHOWTIME ROOM ──────────────────────────────────────────────────
    // Frontend joins a room specific to the showtime they're viewing
    socket.on('join_showtime', async ({ showtimeId }) => {
      try {
        socket.join(`showtime_${showtimeId}`);
        console.log(`👤 ${socket.id} joined showtime room: ${showtimeId}`);

        // Send current locked seats to the newly joined user
        const lockedSeats = await getLockedSeats(showtimeId);
        socket.emit('current_locked_seats', {
          showtime_id:  showtimeId,
          locked_seats: lockedSeats,
        });

      } catch (err) {
        console.error('join_showtime error:', err.message);
      }
    });

    // ─── LEAVE SHOWTIME ROOM ─────────────────────────────────────────────────
    socket.on('leave_showtime', ({ showtimeId }) => {
      socket.leave(`showtime_${showtimeId}`);
      console.log(`👋 ${socket.id} left showtime room: ${showtimeId}`);
    });

    // ─── LOCK SEATS ──────────────────────────────────────────────────────────
    // When user selects seats and clicks "Proceed to Payment"
    socket.on('lock_seats', async ({ showtimeId, seatCodes, userId }) => {
      try {
        const failedSeats = [];

        for (const seatCode of seatCodes) {
          const alreadyLocked = await isSeatLocked(showtimeId, seatCode);
          if (alreadyLocked) {
            failedSeats.push(seatCode);
          }
        }

        if (failedSeats.length > 0) {
          socket.emit('lock_failed', {
            showtime_id:  showtimeId,
            failed_seats: failedSeats,
            message:      `Seats ${failedSeats.join(', ')} are already taken`,
          });
          return;
        }

        // Lock all seats
        for (const seatCode of seatCodes) {
          await lockSeat(showtimeId, seatCode, userId, 600);
        }

        // Store which seats this socket locked (for auto-unlock on disconnect)
        socket.lockedSeats = socket.lockedSeats || {};
        socket.lockedSeats[showtimeId] = seatCodes;

        // Broadcast to everyone in the room that seats are now locked
        io.to(`showtime_${showtimeId}`).emit('seats_locked', {
          showtime_id: showtimeId,
          seats:       seatCodes,
          status:      'locked',
        });

        console.log(`🔒 Seats locked: ${seatCodes.join(', ')} for showtime ${showtimeId}`);

      } catch (err) {
        console.error('lock_seats error:', err.message);
        socket.emit('lock_error', { message: 'Failed to lock seats' });
      }
    });

    // ─── UNLOCK SEATS ────────────────────────────────────────────────────────
    // When user goes back from payment page without completing
    socket.on('unlock_seats', async ({ showtimeId, seatCodes }) => {
      try {
        for (const seatCode of seatCodes) {
          await unlockSeat(showtimeId, seatCode);
        }

        // Clear from socket tracking
        if (socket.lockedSeats && socket.lockedSeats[showtimeId]) {
          delete socket.lockedSeats[showtimeId];
        }

        // Broadcast seats are available again
        io.to(`showtime_${showtimeId}`).emit('seats_unlocked', {
          showtime_id: showtimeId,
          seats:       seatCodes,
          status:      'available',
        });

        console.log(`🔓 Seats unlocked: ${seatCodes.join(', ')} for showtime ${showtimeId}`);

      } catch (err) {
        console.error('unlock_seats error:', err.message);
      }
    });

    // ─── SEATS CONFIRMED (after payment) ─────────────────────────────────────
    // Broadcast to all users in room that seats are permanently booked
    socket.on('confirm_seats', async ({ showtimeId, seatCodes }) => {
      try {
        io.to(`showtime_${showtimeId}`).emit('seats_confirmed', {
          showtime_id: showtimeId,
          seats:       seatCodes,
          status:      'booked',
        });

        console.log(`✅ Seats confirmed: ${seatCodes.join(', ')} for showtime ${showtimeId}`);

      } catch (err) {
        console.error('confirm_seats error:', err.message);
      }
    });

    // ─── AUTO UNLOCK ON DISCONNECT ────────────────────────────────────────────
    // If user closes tab or loses connection, release their locked seats
    socket.on('disconnect', async () => {
      try {
        if (socket.lockedSeats) {
          for (const [showtimeId, seatCodes] of Object.entries(socket.lockedSeats)) {
            for (const seatCode of seatCodes) {
              await unlockSeat(showtimeId, seatCode);
            }

            // Notify room those seats are free again
            io.to(`showtime_${showtimeId}`).emit('seats_unlocked', {
              showtime_id: showtimeId,
              seats:       seatCodes,
              status:      'available',
            });

            console.log(`🔓 Auto-unlocked seats on disconnect: ${seatCodes.join(', ')}`);
          }
        }

        console.log(`❌ Socket disconnected: ${socket.id}`);

      } catch (err) {
        console.error('disconnect cleanup error:', err.message);
      }
    });

  });

};

module.exports = initSeatSocket;