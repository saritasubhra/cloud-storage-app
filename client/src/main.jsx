import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2a24',
            color: '#f7f5ef',
            border: '1px solid #3f5b4a',
            fontFamily: 'IBM Plex Sans, sans-serif',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
