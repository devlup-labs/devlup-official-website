import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from '../App.jsx'

const Header = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)

  return (
    <div>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/team">Team</Link>
        <Link to="/videos">Videos</Link>
      </div>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDarkMode ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}

export default Header