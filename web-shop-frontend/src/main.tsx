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

// Версия с image-in-create (снимка в JSON body) – ако виждаш тази грешка, деплойът не е обновен
(window as any).__WEB_SHOP_BUILD__ = 'image-in-create-v2';
console.log('Starting application...', (window as any).__WEB_SHOP_BUILD__);
console.log('API_BASE:', import.meta.env.VITE_API_BASE_URL || 'https://webshop-e6dx.onrender.com');
console.log('Environment:', import.meta.env.MODE);
console.log('Vite env:', import.meta.env);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee; border: 2px solid #f00;">
      <h1>Критична грешка</h1>
      <p>Root елементът не е намерен. Проверете дали index.html съдържа &lt;div id="root"&gt;&lt;/div&gt;</p>
    </div>
  `;
} else {
  try {
    console.log('Root element found, creating React root...');
    const root = createRoot(rootElement);
    console.log('React root created, rendering app...');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render application:', error);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee; border: 2px solid #f00;">
          <h1>Грешка при зареждане</h1>
          <p>Не можахме да заредим приложението.</p>
          <pre style="background: #fff; padding: 10px; border: 1px solid #ccc; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
          <button onclick="window.location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Презареди страницата
          </button>
        </div>
      `;
    }
  }
}
