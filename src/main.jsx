import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SeatingPage from './components/SeatingPage'
import FilmingPage from './components/FilmingPage'
import SchedulePage from './components/SchedulePage'
import QuizPage from './components/QuizPage'
import './styles/global.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {path === '/seating' ? (
      <SeatingPage />
    ) : path === '/filming' ? (
      <FilmingPage />
    ) : path === '/schedule' ? (
      <SchedulePage />
    ) : path === '/quiz' ? (
      <QuizPage />
    ) : (
      <App />
    )}
  </React.StrictMode>
)
