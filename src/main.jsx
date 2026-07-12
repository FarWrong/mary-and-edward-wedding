import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SeatingPage from './components/SeatingPage'
import FilmingPage from './components/FilmingPage'
import './styles/global.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {path === '/seating' ? (
      <SeatingPage />
    ) : path === '/filming' ? (
      <FilmingPage />
    ) : (
      <App />
    )}
  </React.StrictMode>
)
