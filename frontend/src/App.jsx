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

// Admin imports
import AdminApp from "./admin/AdminApp.jsx";

export const ThemeContext = createContext();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );

    // Apply background to html and body elements
    if (isDarkMode) {
      document.documentElement.style.backgroundImage = "url('/bgweb4.jpeg')";
      document.documentElement.style.backgroundSize = "cover";
      document.documentElement.style.backgroundAttachment = "fixed";
      document.documentElement.style.backgroundPosition = "center";
      document.body.style.backgroundImage = "url('/bgweb4.jpeg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    } else {
      document.documentElement.style.backgroundImage = "url('/bgweb3.jpeg')";
      document.documentElement.style.backgroundSize = "cover";
      document.documentElement.style.backgroundAttachment = "fixed";
      document.documentElement.style.backgroundPosition = "center";
      document.body.style.backgroundImage = "url('/bgweb3.jpeg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <BrowserRouter>
        <div 
          className="w-full min-h-screen text-[var(--text-primary)] transition-all duration-500"
          style={{
            backgroundColor: "transparent"
          }}
        >

          <Routes>

            {/* Home without Header/Footer */}
            <Route path="/" element={<Home />} />

            {/* ✅ WITH HEADER + FOOTER */}
            <Route element={<><Header /><Outlet /><Footer /></>}>

              <Route path="/blog" element={<Blog />} />
              <Route path="/team" element={<Team />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/video" element={<Videos />} />
              <Route path="/podcast" element={<Podcast />} />

              {/* ✅ BLOG VIEW NOW INCLUDED */}
              <Route path="/blogs/:id" element={<BlogView />} />

            </Route>

            {/*  WITHOUT HEADER/FOOTER */}
            <Route path="/portfolio/:username" element={<Portfolio />} />

            {/* Admin Routes - /admin/* goes to AdminApp */}
            <Route path="/admin/*" element={<AdminApp />} />

          </Routes>

        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;