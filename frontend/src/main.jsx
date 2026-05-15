import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

if (!globalThis.__devlupRoot) {
  globalThis.__devlupRoot = createRoot(container)
}

globalThis.__devlupRoot.render(
  <App />,
)
