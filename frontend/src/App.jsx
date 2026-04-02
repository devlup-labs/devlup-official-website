import { createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import BlogView from "./components/BlogView";

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

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">

          <Routes>

            {/* ✅ WITH HEADER + FOOTER */}
            <Route element={<><Header /><Outlet /><Footer /></>}>

              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/team" element={<Team />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/video" element={<Videos />} />
              <Route path="/podcast" element={<Podcast />} />

              {/* ✅ BLOG VIEW NOW INCLUDED */}
              <Route path="/blogs/:id" element={<BlogView />} />

            </Route>

            {/* ❌ WITHOUT HEADER/FOOTER */}
            <Route path="/:username" element={<Portfolio />} />

          </Routes>

        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;