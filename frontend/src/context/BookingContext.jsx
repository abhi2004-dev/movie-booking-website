import { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/helpers';

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initialState = {
  // Auth
  user:     storage.get('user')  || null,
  token:    storage.get('token') || null,
  isAuthed: !!storage.get('token'),

  // Current booking flow
  selectedMovie:    null,
  selectedShowtime: null,
  selectedSeats:    [],
  selectedVenue:    null,
  selectedDate:     null,

  // Payment
  currentBooking:   null,
  razorpayOrder:    null,

  // UI
  isLoading: false,
  error:     null,
};

// ─── ACTION TYPES ─────────────────────────────────────────────────────────────
const ACTIONS = {
  // Auth
  LOGIN:          'LOGIN',
  LOGOUT:         'LOGOUT',
  UPDATE_USER:    'UPDATE_USER',

  // Booking flow
  SET_MOVIE:      'SET_MOVIE',
  SET_SHOWTIME:   'SET_SHOWTIME',
  SET_SEATS:      'SET_SEATS',
  SET_VENUE:      'SET_VENUE',
  SET_DATE:       'SET_DATE',
  SET_BOOKING:    'SET_BOOKING',
  SET_ORDER:      'SET_ORDER',
  CLEAR_BOOKING:  'CLEAR_BOOKING',

  // UI
  SET_LOADING:    'SET_LOADING',
  SET_ERROR:      'SET_ERROR',
  CLEAR_ERROR:    'CLEAR_ERROR',
};

// ─── REDUCER ──────────────────────────────────────────────────────────────────
const bookingReducer = (state, action) => {
  switch (action.type) {

    // ── AUTH ──────────────────────────────────────────────────────────────────
    case ACTIONS.LOGIN:
      storage.set('token', action.payload.token);
      storage.set('user',  action.payload.user);
      return {
        ...state,
        user:     action.payload.user,
        token:    action.payload.token,
        isAuthed: true,
        error:    null,
      };

    case ACTIONS.LOGOUT:
      storage.remove('token');
      storage.remove('user');
      return {
        ...initialState,
        user:     null,
        token:    null,
        isAuthed: false,
      };

    case ACTIONS.UPDATE_USER:
      storage.set('user', action.payload);
      return { ...state, user: action.payload };

    // ── BOOKING FLOW ──────────────────────────────────────────────────────────
    case ACTIONS.SET_MOVIE:
      return { ...state, selectedMovie: action.payload };

    case ACTIONS.SET_SHOWTIME:
      return { ...state, selectedShowtime: action.payload };

    case ACTIONS.SET_SEATS:
      return { ...state, selectedSeats: action.payload };

    case ACTIONS.SET_VENUE:
      return { ...state, selectedVenue: action.payload };

    case ACTIONS.SET_DATE:
      return { ...state, selectedDate: action.payload };

    case ACTIONS.SET_BOOKING:
      return { ...state, currentBooking: action.payload };

    case ACTIONS.SET_ORDER:
      return { ...state, razorpayOrder: action.payload };

    case ACTIONS.CLEAR_BOOKING:
      return {
        ...state,
        selectedMovie:    null,
        selectedShowtime: null,
        selectedSeats:    [],
        selectedVenue:    null,
        selectedDate:     null,
        currentBooking:   null,
        razorpayOrder:    null,
      };

    // ── UI ────────────────────────────────────────────────────────────────────
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const BookingContext = createContext(null);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // ─── AUTH ACTIONS ────────────────────────────────────────────────────────
  const login = (token, user) => {
    dispatch({ type: ACTIONS.LOGIN, payload: { token, user } });
  };

  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
  };

  const updateUser = (user) => {
    dispatch({ type: ACTIONS.UPDATE_USER, payload: user });
  };

  // ─── BOOKING ACTIONS ─────────────────────────────────────────────────────
  const setMovie = (movie) => {
    dispatch({ type: ACTIONS.SET_MOVIE, payload: movie });
  };

  const setShowtime = (showtime) => {
    dispatch({ type: ACTIONS.SET_SHOWTIME, payload: showtime });
  };

  const setSeats = (seats) => {
    dispatch({ type: ACTIONS.SET_SEATS, payload: seats });
  };

  const setVenue = (venue) => {
    dispatch({ type: ACTIONS.SET_VENUE, payload: venue });
  };

  const setDate = (date) => {
    dispatch({ type: ACTIONS.SET_DATE, payload: date });
  };

  const setBooking = (booking) => {
    dispatch({ type: ACTIONS.SET_BOOKING, payload: booking });
  };

  const setOrder = (order) => {
    dispatch({ type: ACTIONS.SET_ORDER, payload: order });
  };

  const clearBooking = () => {
    dispatch({ type: ACTIONS.CLEAR_BOOKING });
  };

  // ─── UI ACTIONS ──────────────────────────────────────────────────────────
  const setLoading = (bool) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: bool });
  };

  const setError = (msg) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  return (
    <BookingContext.Provider value={{
      // State
      ...state,

      // Auth
      login,
      logout,
      updateUser,

      // Booking
      setMovie,
      setShowtime,
      setSeats,
      setVenue,
      setDate,
      setBooking,
      setOrder,
      clearBooking,

      // UI
      setLoading,
      setError,
      clearError,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used inside BookingProvider');
  }
  return context;
};

export default BookingContext;