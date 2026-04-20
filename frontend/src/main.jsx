import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { BookingProvider } from './context/BookingContext';
import './styles/globals.css';

// You will need to replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <BookingProvider>

        {/* ─── GLOBAL TOAST NOTIFICATIONS ─────────────────────────────── */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background:  '#0f0f1e',
              color:       '#ede9e0',
              border:      '1px solid rgba(240,192,64,0.2)',
              borderRadius:'10px',
              fontSize:    '14px',
              fontFamily:  'Outfit, sans-serif',
              padding:     '12px 16px',
            },
            success: {
              iconTheme: {
                primary:   '#f0c040',
                secondary: '#07070f',
              },
            },
            error: {
              iconTheme: {
                primary:   '#e0303a',
                secondary: '#07070f',
              },
            },
          }}
        />

        <App />

      </BookingProvider>
    </BrowserRouter>
  </React.StrictMode>
);