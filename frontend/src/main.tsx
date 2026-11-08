import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Initialise auth session
import { useAuth } from '@/stores/auth';
import { useAdminAuth } from '@/stores/adminAuth';
import { useCart } from '@/stores/cart';

useAuth.getState().init();
useAdminAuth.getState().init();
useCart.getState().fetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium rounded-2xl shadow-lift border border-zinc-200/80',
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);
