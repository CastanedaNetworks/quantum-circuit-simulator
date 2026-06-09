import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// StrictMode is intentionally disabled: it double-mounts components in
// development, which double-initializes DndProvider's HTML5 backend.
root.render(
  <App />
);
