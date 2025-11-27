import './index.css'

import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const ROOT = createRoot(document.getElementById('root'))

document.documentElement.classList.add('lightTheme')

ROOT.render(
  <App />
)