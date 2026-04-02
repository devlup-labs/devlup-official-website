import { useState } from "react";
import { FaTags } from "react-icons/fa";

export default function FilterButton() {
  const [open, setOpen] = useState(false);
  const tags = ["All", "3D Web", "Blockchain", "JS", "React", "Cloud"];

  return (
    <div className="z-[2000]">

      {/* SINGLE CONTAINER (IMPORTANT) */}
      <div
        className={`
          flex items-center overflow-hidden
          bg-[var(--bg-muted)] backdrop-blur-md border border-white/10
          transition-all duration-500 ease-in-out
          ${open ? "pr-3" : ""}
          rounded-full
        `}
      >

        {/* BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className={`
            flex items-center justify-center text-white
            w-10 h-10 md:w-auto md:px-4
            transition-all duration-300 cursor-pointer
          `}
        >
          <FaTags size={16} />
          <span className={`ml-2 text-xs text-white font-medium hidden md:block transition-opacity duration-300 ${open ? "opacity-100" : "opacity-100"}`}>
            Filters
          </span>
        </button>

        {/* TAGS */}
        <div
          className={`
            flex items-center gap-2
            transition-all duration-500 ease-in-out
            ${open ? "max-w-[500px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
            overflow-hidden
          `}
        >
          {tags.map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 rounded-full text-[10px] md:text-xs text-white hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}