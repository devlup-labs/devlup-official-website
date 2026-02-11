import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

function HeaderComponent() {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Podcasts", path: "/podcasts" },
    { name: "Videos", path: "/videos" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT */}
        <div className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] backdrop-blur-md border hover:scale-110 border-[var(--border-subtle)] rounded-xl flex items-center gap-3 px-6 py-2 hover:cursor-pointer">
          <img
            src="/logo.jpeg"
            alt="Club Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-[var(--text-primary)] text-lg font-semibold">
            Devlup Labs
          </h1>
        </div>

        {/* RIGHT */}
        <div
  className={`
    flex items-center gap-1
    px-3 py-2
    bg-[var(--bg-surface)] backdrop-blur-md
    border border-[var(--border-subtle)]
    rounded-xl
    transition-transform duration-200
    ${!open ? "hover:scale-110 hover:bg-[var(--bg-surface-hover)]" : "scale-100"}
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
                px-3 py-1 rounded-lg
                bg-[var(--btn-secondary-bg)]
                text-[var(--btn-secondary-text)]
                border border-[var(--border-subtle)]
                transition
              "
            >
              {isDarkMode ? "Light" : "Dark"}
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