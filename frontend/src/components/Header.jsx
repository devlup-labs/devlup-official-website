import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

function HeaderComponent() {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navItems = [

    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Podcasts", path: "/podcast" },
    { name: "Videos", path: "/video" },
    { name: "timeline", path: "/Timeline" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-9999">
      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT */}
        
       <Link
  to="/"
  className="bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)]
  backdrop-blur-md border border-[var(--border-subtle)]
  rounded-xl flex items-center gap-3 px-6 py-2
  transition-all duration-200
  hover:scale-110 hover:cursor-pointer"
>
  <img
    src="/logo.jpeg"
    alt="Club Logo"
    className="w-10 h-10 object-contain"
  />
  <h1 className="text-[var(--text-primary)] text-lg font-semibold">
    Devlup Labs
  </h1>
</Link>
        {/* RIGHT */}
        <div
  className={`
    flex items-center gap-1
    px-3 py-2
    bg-[var(--bg-surface)] backdrop-blur-md
    border border-[var(--border-subtle)]
    rounded-xl
    transition-transform duration-200
    ${!open ? "hover:scale-110 hover:bg-[var(--bg-muted)]" : "scale-100"}
  `}
>

          {/* MENU */}
          <nav
            className={`
              flex items-center gap-6
              overflow-hidden
              transition-all duration-300 ease-out
              ${
                open
                  ? "max-w-[600px] opacity-100"
                  : "max-w-0 opacity-0"
              }
            `}
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="text-[var(--text-primary)] whitespace-nowrap hover:text-blue-500 transition"
              >
                {item.name}
              </Link>
            ))}

            {/* THEME TOGGLE INSIDE MENU */}
            <button
  onClick={toggleTheme}
  className="
    p-2 rounded-lg
    bg-[var(--bg-surface)]
    border border-[var(--border-subtle)]
    transform-gpu will-change-transform
    flex items-center justify-center
    hover: cursor-pointer
  "
>
  {isDarkMode ? (
    /* SUN ICON (light mode icon) */
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
    /* MOON ICON (dark mode icon) */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-[var(--text-primary)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 12.79A9 9 0 1111.21 3
      7 7 0 0021 12.79z" />
    </svg>
  )}
</button>
          </nav>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1.5 px-2 py-1
            rounded-lg
            transition-all duration-300
            hover:cursor-pointer 
            active:scale-95"
          >
            <span
              className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;