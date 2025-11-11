import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress COOP warnings in development (they don't affect functionality)
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        message.includes('Cross-Origin-Opener-Policy policy would block')) {
      return; // Suppress this specific warning
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
