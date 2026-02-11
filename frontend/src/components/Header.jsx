import { useState } from "react";
import { Link } from "react-router-dom";

function HeaderComponent() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Events", path: "/events" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT */}
        <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-3 px-6 py-2">
          <img
            src="/logo.jpeg"
            alt="Club Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-white text-lg font-semibold">
            Devlup Club
          </h1>
        </div>

        {/* RIGHT — EXPANDING CONTAINER */}
        <div
          className="
            flex items-center gap-4
            px-3 py-2
            bg-black/10 backdrop-blur-md
            border border-white/20
            rounded-xl
            transition-all duration-300
          "
        >

          {/* MENU */}
          <nav
            className={`
              flex items-center gap-6
              overflow-hidden
              transition-all duration-300 ease-out
              ${open
                ? "max-w-[600px] opacity-100"
                : "max-w-0 opacity-0"}
            `}
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="text-white whitespace-nowrap hover:text-purple-400 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1.5 px-2 py-1"
          >
            <span className={`h-0.5 w-6 bg-white transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-0.5 w-6 bg-white transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-white transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
