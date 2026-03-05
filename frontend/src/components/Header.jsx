import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

function HeaderComponent() {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Podcasts", path: "/podcast" },
    { name: "Videos", path: "/video" },
    { name: "Timeline", path: "/timeline" },
  ];

  // Prevent background scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      {/* HEADER */}
  <header
  className={`
    fixed top-0 left-0 w-full z-50 pointer-events-auto
    transition-all duration-500
    ease-[cubic-bezier(0.16,1,0.3,1)]

    ${open
      ? "bg-black/40 backdrop-blur-xl"
      : "bg-transparent "}
    
    md:bg-transparent md:backdrop-blur-0
  `}
>
   {/* <header
  className="
    fixed top-0 left-0 w-full z-50
    bg-transparent
    backdrop-blur-0
    transition-all duration-500
  "
> */}
        <div className="flex items-center justify-between px-6 py-4">

          {/* LEFT */}
          <div className="bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)]
            backdrop-blur-md border border-[var(--border-subtle)]
            rounded-xl flex items-center gap-3 px-6 py-2
            transition hover:scale-110 cursor-pointer">
            <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-[var(--text-primary)] text-lg font-semibold">
              Devlup Labs
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center">

            {/* DESKTOP MENU */}
            <div className={`hidden md:flex items-center gap-1 px-3 py-2
              bg-[var(--bg-surface)] backdrop-blur-md
              border border-[var(--border-subtle)]
              rounded-xl transition-transform duration-200
              ${!open ? "hover:scale-110 hover:bg-[var(--bg-muted)]" : ""}`}>

              <nav className={`flex items-center gap-6 overflow-hidden
                transition-all duration-300 ease-out
                ${open ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"}`}>
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="text-[var(--text-primary)] whitespace-nowrap
                    hover:text-blue-500 transition"
                  >
                    {item.name}
                  </Link>
                ))}

                <button
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-lg
                  bg-[var(--btn-secondary-bg)]
                  text-[var(--btn-secondary-text)]
                  border border-[var(--border-subtle)]"
                >
                  {isDarkMode ? "Light" : "Dark"}
                </button>
              </nav>

              {/* DESKTOP HAMBURGER */}
              <button
                onClick={() => setOpen(!open)}
                className="flex flex-col gap-1.5 px-2 py-1"
              >
                <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                  transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                  transition-all ${open ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                  transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden flex flex-col gap-1.5 px-2 py-1 z-50"
            >
              <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)]
                transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

          </div>
        </div>
      </header>

{/* MOBILE MENU – TRANSPARENT → GLASS */}
<div
  className={`
   fixed top-[72px] left-0 right-0 bottom-0
    z-40 md:hidden

    bg-black/40 backdrop-blur-2xl

    flex flex-col items-center justify-center
    space-y-8
    text-2xl font-semibold text-white

    transition-all duration-500
    ease-[cubic-bezier(0.16,1,0.3,1)]
    transform-gpu

    ${open
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-4 pointer-events-none"}
  `}
>
  <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
  {navItems.map((item, index) => (
    <Link
      key={item.name}
      to={item.path}
      onClick={() => setOpen(false)}
      style={{ transitionDelay: `${index * 70}ms` }}
      className={`
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        transform-gpu

        ${open
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"}

        hover:text-blue-400
      `}
    >
      {item.name}
    </Link>
  ))}

  {/* THEME BUTTON */}
  <button
    onClick={toggleTheme}
    style={{ transitionDelay: `${navItems.length * 70}ms` }}
    className={`
      mt-6 px-6 py-2 rounded-lg border border-white
      transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
      transform-gpu

      ${open
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-6"}
    `}
  >
    {isDarkMode ? "Light Mode" : "Dark Mode"}
  </button>
</div>
    </>
  );
}

export default HeaderComponent;