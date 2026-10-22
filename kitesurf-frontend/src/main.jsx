// Importeer React, StrictMode, CSS-stijlen en de hoofd-App-component
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Dashboards.css'
import App from './App.jsx'

// Koppel de React-app aan het <div id="root"> element in index.html en render de App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
