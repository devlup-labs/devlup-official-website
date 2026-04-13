import { CiSearch } from "react-icons/ci";

export default function SearchBar({ searchOpen, setSearchOpen, searchTerm = "", setSearchTerm = () => {} }) {
  return (
    <div className="flex items-center relative z-[2000]" onClick={(e) => e.stopPropagation()}>
      
      <div
        className={`
          flex items-center
          bg-[var(--bg-muted)]
          border border-[var(--border-subtle)]
          rounded-full
          transition-all duration-500 ease-out
          pointer-events-auto
          ${searchOpen
            ? "w-[300px] h-10 px-4 justify-start"
            : "w-10 h-10 justify-center"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SEARCH ICON */}
        <CiSearch
          className="text-white cursor-pointer shrink-0 pointer-events-auto"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            setSearchOpen(!searchOpen);
          }}
        />

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
            pointer-events-auto
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