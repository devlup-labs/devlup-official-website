import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './components/Router.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
