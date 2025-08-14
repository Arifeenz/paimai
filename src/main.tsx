import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { LanguageProvider } from '@/contexts/LanguageContext'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <LanguageProvider> {/* ✅ เพิ่มตรงนี้ */}
      <App />
    </LanguageProvider>
  </ErrorBoundary>
);
