const Booking  = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Seat     = require('../models/Seat');
const { lockSeat, unlockMultipleSeats, getLockedSeats, isSeatLocked } = require('../config/redis');

// ─── GET SEAT AVAILABILITY ────────────────────────────────────────────────────
const getSeatAvailability = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
  return res.status(404).json({ error: 'No show for this showtime' });
}

    // Get booked seats from DB
    const bookedSeats = await Showtime.getBookedSeats(showtimeId);

    // Get locked seats from Redis
    const lockedSeats = await getLockedSeats(showtimeId);

    res.json({
      showtime_id:   showtimeId,
      booked_seats:  bookedSeats,
      locked_seats:  lockedSeats,
      pricing: {
        premium: showtime.price_premium,
        gold:    showtime.price_gold,
        silver:  showtime.price_silver,
      },
    });

  } catch (err) {
    console.error('Get seat availability error:', err.message);
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
};

// ─── LOCK SEATS (hold for 10 mins while user proceeds to payment) ─────────────
const lockSeats = async (req, res) => {
  try {
    const { showtimeId, seatCodes } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seatCodes || !Array.isArray(seatCodes) || seatCodes.length === 0) {
      return res.status(400).json({ error: 'showtimeId and seatCodes array are required' });
    }

    if (seatCodes.length > 10) {
      return res.status(400).json({ error: 'Cannot book more than 10 seats at once' });
    }

    // Check showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    // Check seats not already booked in DB
    const areFree = await Showtime.areSeatsFree(showtimeId, seatCodes);
    if (!areFree) {
      return res.status(409).json({ error: 'One or more seats are already booked' });
    }

    // Check seats not locked in Redis by someone else
    for (const seatCode of seatCodes) {
      const locked = await isSeatLocked(showtimeId, seatCode);
      if (locked) {
        return res.status(409).json({
          error: `Seat ${seatCode} is currently being held by another user`,
        });
      }
    }

    // Lock all selected seats in Redis for 10 minutes
    for (const seatCode of seatCodes) {
      await lockSeat(showtimeId, seatCode, userId, 600);
    }

    // Calculate price
    const pricing = await Showtime.getPricing(showtimeId);
    const price   = await Seat.calculatePrice(showtime.screen_id, seatCodes, pricing);

    res.json({
      message:    'Seats locked for 10 minutes',
      expires_in: 600,
      seats:      seatCodes,
      ...price,
    });

  } catch (err) {
    console.error('Lock seats error:', err.message);
    res.status(500).json({ error: 'Failed to lock seats' });
  }
};

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seatCodes, orderId } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seatCodes || !orderId) {
      return res.status(400).json({ error: 'showtimeId, seatCodes and orderId are required' });
    }

    // Verify showtime
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    // Double check seats still free in DB
    const areFree = await Showtime.areSeatsFree(showtimeId, seatCodes);
    if (!areFree) {
      return res.status(409).json({ error: 'One or more seats are no longer available' });
    }

    // Calculate final price
    const pricing = await Showtime.getPricing(showtimeId);
    const price   = await Seat.calculatePrice(showtime.screen_id, seatCodes, pricing);

    // Create booking in DB (status: pending)
    const booking = await Booking.create({
      userId,
      showtimeId,
      seats:          seatCodes,
      subtotal:       price.subtotal,
      convenienceFee: price.convenience_fee,
      grandTotal:     price.grand_total,
      orderId,
    });

    res.status(201).json({
      message: 'Booking created, awaiting payment',
      booking,
      pricing: price,
    });

  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// ─── GET USER BOOKINGS ────────────────────────────────────────────────────────
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);
    res.json({
      count: bookings.length,
      bookings,
    });

  } catch (err) {
    console.error('Get user bookings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// ─── GET SINGLE BOOKING ───────────────────────────────────────────────────────
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only owner can view
    const isOwner = await Booking.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });

  } catch (err) {
    console.error('Get booking error:', err.message);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwner = await Booking.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const cancelled = await Booking.cancel(id);

    res.json({
      message: 'Booking cancelled successfully',
      booking: cancelled,
    });

  } catch (err) {
    console.error('Cancel booking error:', err.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

module.exports = {
  getSeatAvailability,
  lockSeats,
  createBooking,
  getUserBookings,
  getBooking,
  cancelBooking,
};