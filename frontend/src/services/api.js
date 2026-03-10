import axios from 'axios';
import { storage } from '../utils/helpers';

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR (attach JWT token) ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = storage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR (handle auth errors) ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      storage.remove('token');
      storage.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  getProfile:()      => api.get('/auth/profile'),
  updateProfile:(data)=> api.put('/auth/profile', data),
  verify:   ()       => api.get('/auth/verify'),
};

// ─── MOVIES ───────────────────────────────────────────────────────────────────
export const movieAPI = {
  getAll:      (params)      => api.get('/movies', { params }),
  getTrending: (limit = 8)   => api.get('/movies/trending', { params: { limit } }),
  getById:     (id)          => api.get(`/movies/${id}`),
  getWithShowtimes: (id, date) => api.get(`/movies/${id}/showtimes`, { params: { date } }),
  search:      (q)           => api.get('/movies/search', { params: { q } }),
  getGenres:   ()            => api.get('/movies/genres'),
  getLanguages:()            => api.get('/movies/languages'),
  getSeatStatus:(showtimeId) => api.get(`/movies/showtimes/${showtimeId}/seats`),
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  getAll:       ()           => api.get('/bookings'),
getById: (id, date) =>
  api.get(`/movies/${id}`, { params: { date } }),  getSeatAvailability: (showtimeId) => api.get(`/bookings/seats/${showtimeId}`),
  lockSeats:    (data)       => api.post('/bookings/lock', data),
  create:       (data)       => api.post('/bookings', data),
  cancel:       (id)         => api.put(`/bookings/${id}/cancel`),
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder:    (data)     => api.post('/payment/order', data),
  verifyPayment:  (data)     => api.post('/payment/verify', data),
  paymentFailed:  (data)     => api.post('/payment/failed', data),
  getDetails:     (paymentId)=> api.get(`/payment/${paymentId}`),
};

// ─── RAZORPAY CHECKOUT ────────────────────────────────────────────────────────
export const openRazorpay = ({ orderId, amount, keyId, bookingId, user, onSuccess, onFailure }) => {
  const options = {
    key:         keyId,
    amount:      amount,
    currency:    'INR',
    name:        'Cinéplex',
    description: 'Movie Ticket Booking',
    order_id:    orderId,
    prefill: {
      name:    user?.name  || '',
      email:   user?.email || '',
      contact: user?.phone || '',
    },
    theme: {
      color: '#f0c040',
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure('Payment cancelled by user');
      },
    },
    handler: (response) => {
      if (onSuccess) onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    if (onFailure) onFailure(response.error.description);
  });
  rzp.open();
};

export default api;