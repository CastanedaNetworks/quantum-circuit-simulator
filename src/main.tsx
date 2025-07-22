import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

console.log('[Main] Starting application...');

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('[Main] Root element found:', !!rootElement);

if (!rootElement) {
  console.error('[Main] No root element found!');
  throw new Error('Root element not found');
}

console.log('[Main] Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('[Main] Rendering App component...');
// Temporarily disable StrictMode to avoid double-initialization of DndProvider
// React.StrictMode causes components to render twice in development
root.render(
  <App />
);

console.log('[Main] App render initiated');