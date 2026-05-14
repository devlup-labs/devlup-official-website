import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({
  searchOpen,
  setSearchOpen,
  searchTerm = "",
  setSearchTerm = () => { },
}) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex items-center relative z-[2000]"
      onClick={(e) => e.stopPropagation()}
    >

      <div
        className={`
          flex items-center
          bg-[var(--bg-muted)]
          border border-[var(--border-subtle)]
          rounded-full
          transition-all duration-500 ease-out
          pointer-events-auto
          overflow-hidden
          ${searchOpen
            ? isMobile
              ? "w-[calc(100vw-32px)] h-10 px-4 justify-start"
              : "w-[320px] h-10 px-4 justify-start"
            : "w-10 h-10 justify-center"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* SEARCH ICON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSearchOpen(!searchOpen);
          }}
          className="shrink-0 text-white"
        >
          <CiSearch size={18} />
        </button>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-transparent border-none outline-none
            text-white text-sm
            transition-all duration-300
            placeholder:text-gray-400
            ${searchOpen
              ? "w-full ml-3 opacity-100"
              : "w-0 opacity-0"
            }
          `}
        />
      </div>
    </div>
  );
}