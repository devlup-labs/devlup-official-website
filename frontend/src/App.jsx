import { createContext, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Blog from './pages/Blog.jsx'
import Team from './pages/Team.jsx'
import Timeline from './pages/Timeline.jsx'
import Videos from './pages/Videos.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProfileLayout  from "./components/Portfolio.jsx";

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => { }
})

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const toggleTheme = () => setIsDarkMode(t => !t)
  const [showSensitive, setShowSensitive] = useState(false);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/team" element={<Team />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/videos" element={<Videos />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
      <ProfileLayout
      showSensitive={showSensitive}
      onReveal={() => setShowSensitive(true)}
      onBack={() => setShowSensitive(false)}
    />
    </ThemeContext.Provider>
    
  )
}

export default App
