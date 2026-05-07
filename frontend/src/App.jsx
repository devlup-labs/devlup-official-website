import { createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

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

// ✅ Admin components
import Login from "./admin/components/Login";
import Dashboard from "./admin/components/Dashboard";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import Forbidden from "./admin/components/Forbidden"; // adjust path

export const ThemeContext = createContext();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token")); // ✅ added
   const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

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
    // Ensure Tailwind's `dark:` variants also work by toggling the `dark` class
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, hamburgerOpen, setHamburgerOpen, searchOpen, setSearchOpen, filterOpen, setFilterOpen }}>
      <BrowserRouter>
        <div className="w-full min-h-screen text-[var(--text-primary)] transition-all duration-500">

          <Routes>

            {/* 🌐 PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />

            <Route element={<><Header /><Outlet /><Footer /></>}>
              <Route path="/blog" element={<Blog />} />
              <Route path="/team" element={<Team />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/video" element={<Videos />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/blogs/:id" element={<BlogView />} />
            </Route>

            <Route path="/portfolio/:username" element={<Portfolio />} />

            {/* 🔐 ADMIN ROUTES (NO /admin) */}
            <Route path="/login" element={<Login setToken={setToken} />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard token={token} setToken={setToken} />
                </ProtectedRoute>
              }
            />
            
           
<Route path="/403" element={<Forbidden />} />

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>

        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;