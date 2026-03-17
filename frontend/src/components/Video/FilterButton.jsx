import { useState } from "react";
import { FaTags } from "react-icons/fa";

export default function FilterButton() {
  const [open, setOpen] = useState(false);
  const tags = ["All", "3D Web", "Blockchain", "JS", "React", "Cloud"];

  return (
    <div className="flex items-center gap-2 z-[20000]">
      {/* The Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-4 rounded-full border transition-all duration-300
          ${open ? "bg-purple-600 border-purple-400 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}
        `}
      >
        <FaTags size={16} />
        <span className="hidden md:block ml-2 text-xs font-medium">Filters</span>
      </button>

      {/* The Sliding Container */}
      <div className={`
        flex items-center gap-2 overflow-hidden transition-all duration-500 ease-in-out
        ${open ? "max-w-[500px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
      `}>
        <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3">
          {tags.map((tag) => (
            <button 
              key={tag} 
              className="px-3 py-1 rounded-full text-[10px] md:text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}