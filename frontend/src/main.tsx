import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { PromptProvider } from './context/PromptContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <PromptProvider>
          <App />
        </PromptProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
