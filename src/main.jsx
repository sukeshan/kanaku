import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/chartConfig' // Register Chart.js components globally
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

console.log('Main.jsx: Initializing application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('Main.jsx: Render called successfully');
} catch (error) {
  console.error('Main.jsx: Critical initialization error:', error);
}

