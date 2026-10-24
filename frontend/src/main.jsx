import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'inherit' } }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
