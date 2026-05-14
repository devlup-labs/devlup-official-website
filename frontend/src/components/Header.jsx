import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

function HeaderComponent({ onClose }) {
  const { isDarkMode, toggleTheme, hamburgerOpen, setHamburgerOpen, searchOpen, setSearchOpen, filterOpen, setFilterOpen } = useContext(ThemeContext);

  const navItems = [
    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Podcasts", path: "/podcast" },
    { name: "Videos", path: "/video" },
    { name: "Timeline", path: "/timeline" },
  ];

  /* 🔥 SCROLL FIX (IMPORTANT) */
  useEffect(() => {
    // Always ensure scroll is enabled
    document.body.style.overflow = "auto";

    // Cleanup (in case component unmounts)
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleHamburgerClick = () => {
    const newState = !hamburgerOpen;
    setHamburgerOpen(newState);
    if (newState) {
      if (searchOpen) setSearchOpen(false);
      if (filterOpen) setFilterOpen(false);
    }
  };

  const handleLogoClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[1000]
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        bg-transparent`}
      >
        <div className="flex items-center px-6 py-4">

          {/* LEFT */}
          {onClose ? (
            <button
              onClick={handleLogoClick}
              className="bg-[var(--bg-surface)]
              border border-[var(--border-subtle)]
              rounded-xl flex items-center justify-center md:justify-start
              gap-0 md:gap-3
              p-0 md:px-6 md:py-2
              w-14 h-14 md:w-auto md:h-auto
              transition hover:scale-110 cursor-pointer"
            >
              <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-[var(--text-primary)] text-lg font-semibold hidden md:inline">
                DevlUp Labs
              </h1>
            </button>
          ) : (
            <Link
              to="/"
              className="bg-[var(--bg-surface)]
              border border-[var(--border-subtle)]
              rounded-xl flex items-center justify-center md:justify-start
              gap-0 md:gap-3
              p-0 md:px-6 md:py-2
              w-14 h-14 md:w-auto md:h-auto
              transition hover:scale-110 cursor-pointer"
            >
              <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-[var(--text-primary)] text-lg font-semibold hidden md:inline">
                DevlUp Labs
              </h1>
            </Link>
          )}

          {/* RIGHT */}
          <div className="flex items-center ml-auto">

            {/* DESKTOP MENU */}
            <div
              className={`hidden md:flex items-center gap-1
              ${hamburgerOpen ? 'px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl' : 'px-0 py-0 bg-transparent border-transparent rounded-xl'}
              transition-transform duration-200 ${!hamburgerOpen ? "hover:scale-110" : ""}`}
            >
              <nav
                className={`flex items-center gap-0 overflow-hidden
                transition-all duration-300 ease-out 
                ${hamburgerOpen ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"}`}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setHamburgerOpen(false)}
                    className="flex h-10 items-center rounded-lg px-6 text-[var(--text-primary)] whitespace-nowrap transition hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* THEME TOGGLE */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg flex items-center justify-center hover:cursor-pointer transition hover:bg-black/5 dark:hover:bg-white/5"
                >
  {isDarkMode ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-[var(--text-primary)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-[var(--text-primary)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )}
</button>
              </nav>
            </div>

            {/* DESKTOP HAMBURGER */}
            <button
              type="button"
              onClick={handleHamburgerClick}
              aria-label="Toggle navigation menu"
              className="hidden md:flex relative ml-2 h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition hover:scale-110 cursor-pointer"
            >
              <span className="pointer-events-none flex flex-col gap-1.5">
                <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </span>
            </button>

            {/* MOBILE HAMBURGER */}
            <button
              type="button"
              onClick={handleHamburgerClick}
              aria-label="Toggle navigation menu"
              className="md:hidden flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] z-50 transition hover:scale-110 cursor-pointer"
            >
                <span className="pointer-events-none flex flex-col gap-1.5">
                  <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-0.5 w-6 bg-[var(--text-primary)] transition-all ${hamburgerOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </span>
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`
          fixed top-0 left-0 right-0 bottom-0
          z-40 md:hidden
          bg-black/40 backdrop-blur-2xl
          flex flex-col items-center justify-center
          space-y-8 text-2xl font-semibold text-white
          transition-all duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          transform-gpu
          ${hamburgerOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setHamburgerOpen(false)}
            style={{ transitionDelay: `${index * 70}ms` }}
            className={`min-w-[220px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-3 text-center text-[var(--text-primary)] transition-all duration-500 transform-gpu
            ${hamburgerOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            hover:text-blue-400`}
          >
            {item.name}
          </Link>
        ))}

        {/* THEME TOGGLE */}
    <button
  onClick={toggleTheme}
  className={`mt-6 p-3 rounded-lg
  bg-[var(--bg-surface)]
  border border-[var(--border-subtle)]
  flex items-center justify-center
  transition-all duration-500 transform-gpu
  ${hamburgerOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
>
  {isDarkMode ? ( <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-[var(--text-primary)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
    /* SAME SUN SVG */
  ) : (<svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-[var(--text-primary)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
    /* SAME MOON SVG */
  )}
</button>
      </div>
    </>
  );
}

export default HeaderComponent;