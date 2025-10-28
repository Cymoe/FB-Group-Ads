import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EnhancedApp from './EnhancedApp'

console.log('🚀 Main.tsx loading...')
console.log('Root element:', document.getElementById('root'))

try {
  const root = createRoot(document.getElementById('root')!)
  console.log('✅ Root created successfully')
  
  root.render(
    <StrictMode>
      <EnhancedApp />
    </StrictMode>
  )
  console.log('✅ App rendered successfully')
} catch (error) {
  console.error('❌ Error mounting app:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="color: red; padding: 20px; font-size: 24px;">
      ❌ ERROR: ${error}
    </div>
  `
}
