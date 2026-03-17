
import { createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Outlet }from "react-router-dom";

import "./App.css";

import Home from "./pages/Home.jsx";
import Blog from "./pages/Blog.jsx";
import Team from "./pages/Team.jsx";
import Timeline from "./pages/Timeline.jsx";
import Videos from "./pages/Videos.jsx";
import Podcast from "./pages/Podcast.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Portfolio from "./components/Portfolio.jsx";
export const ThemeContext = createContext();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

// In App.jsx
return (
  <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">
        
        <Routes>
          {/* Routes WITH Header/Footer */}
          <Route element={<><Header /><Outlet /><Footer /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/team" element={<Team />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/video" element={<Videos />} />
            <Route path="/podcast" element={<Podcast />} />
          </Route>

          {/* Route WITHOUT Header/Footer */}
          <Route path="/:username" element={<Portfolio />} /> 
        </Routes>

      </div>
    </BrowserRouter>
  </ThemeContext.Provider>
);
}

export default App;