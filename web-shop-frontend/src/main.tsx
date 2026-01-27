import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'

// Error handling за да видим грешките
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting application...');
console.log('API_BASE:', import.meta.env.VITE_API_BASE_URL || 'https://webshop-e6dx.onrender.com');
console.log('Environment:', import.meta.env.MODE);
console.log('Vite env:', import.meta.env);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Грешка при зареждане</h1>
      <p>Не можахме да заредим приложението.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
