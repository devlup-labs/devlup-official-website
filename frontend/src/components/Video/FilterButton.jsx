import { FaTags } from "react-icons/fa";

export default function FilterButton({
  filterOpen,
  setFilterOpen,
  selectedTags = [],
  setSelectedTags = () => { },
  tags = ["3D Web", "Blockchain", "JS", "React", "Cloud"]
}) {

  return (
    <div className="z-[2000]" onClick={(e) => e.stopPropagation()}>

      {/* SINGLE CONTAINER (IMPORTANT) */}
      <div
        onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => {
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
          onClick={(e) => e.stopPropagation()}
          className={`
            flex items-center gap-2
            transition-all duration-500 ease-in-out
            ${filterOpen ? "max-w-[800px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
            overflow-hidden
            pointer-events-auto
          `}
        >
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
              className={`px-3 py-1 rounded-full text-[10px] md:text-xs transition-colors whitespace-nowrap pointer-events-auto ${selectedTags.includes(tag)
                ? "bg-white/30 text-white font-semibold"
                : "text-white hover:text-white hover:bg-white/10"
                }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTags([]);
              }}
              className="px-3 py-1 rounded-full text-[10px] md:text-xs transition-colors whitespace-nowrap pointer-events-auto text-red-300 hover:bg-white/10 hover:text-red-200 ml-2"
            >
              Clear All
            </button>
          )}
        </div>

      </div>
    </div>
  );
}