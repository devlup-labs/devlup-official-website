import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center relative z-[2000]">
      
      <div
        className={`
          flex items-center
          bg-[var(--bg-muted)]
          border border-[var(--border-subtle)]
          rounded-full
          transition-all duration-500 ease-out

          ${open
            ? "w-[300px] h-10 px-4 justify-start"
            : "w-10 h-10 justify-center"
          }
        `}
      >
        {/* SEARCH ICON */}
        <CiSearch
          className="text-white cursor-pointer shrink-0"
          size={18}
          onClick={() => setOpen(!open)}
        />

        {/* INPUT */}
        <input
          type="text"
          placeholder="Search..."
          className={`
            bg-transparent border-none outline-none
            text-white text-sm
            transition-all duration-300

            ${open
              ? "w-full ml-3 opacity-100"
              : "w-0 opacity-0"
            }
          `}
        />
      </div>

    </div>
  );
}