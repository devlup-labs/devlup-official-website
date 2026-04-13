import { FaTags } from "react-icons/fa";

export default function FilterButton({ 
  filterOpen, 
  setFilterOpen,
  selectedTag = "All",
  setSelectedTag = () => {},
  tags = ["All", "3D Web", "Blockchain", "JS", "React", "Cloud"]
}) {

  return (
    <div className="z-[2000]" onMouseDown={(e) => e.stopPropagation()}>

      {/* SINGLE CONTAINER (IMPORTANT) */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`
          flex items-center overflow-hidden
          bg-[var(--bg-muted)] backdrop-blur-md border border-white/10
          transition-all duration-500 ease-in-out
          ${filterOpen ? "pr-3" : ""}
          rounded-full
          pointer-events-auto
        `}
      >

        {/* BUTTON */}
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            setFilterOpen(!filterOpen);
          }}
          className={`
            flex items-center justify-center text-white
            w-10 h-10 md:w-auto md:px-4
            transition-all duration-300 cursor-pointer
            pointer-events-auto
          `}
        >
          <FaTags size={16} />
          <span className={`ml-2 text-xs text-white font-medium hidden md:block transition-opacity duration-300 ${filterOpen ? "opacity-100" : "opacity-100"}`}>
            Filters
          </span>
        </button>

        {/* TAGS */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={`
            flex items-center gap-2
            transition-all duration-500 ease-in-out
            ${filterOpen ? "max-w-[500px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
            overflow-hidden
            pointer-events-auto
          `}
        >
          {tags.map((tag) => (
            <button
              key={tag}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedTag(tag);
              }}
              className={`px-3 py-1 rounded-full text-[10px] md:text-xs transition-colors whitespace-nowrap pointer-events-auto ${
                selectedTag === tag
                  ? "bg-white/30 text-white font-semibold"
                  : "text-white hover:text-white hover:bg-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}