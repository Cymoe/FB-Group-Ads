import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EnhancedApp from './EnhancedApp'
import { ErrorBoundary } from './components/ErrorBoundary'

try {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <EnhancedApp />
      </ErrorBoundary>
    </StrictMode>
  )
} catch (error) {
  console.error('❌ Error mounting app:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="color: red; padding: 20px; font-size: 24px;">
      ❌ ERROR: ${error}
    </div>
  `
}
