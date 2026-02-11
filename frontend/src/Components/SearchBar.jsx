import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({ onToggle }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onToggle(open);
  }, [open, onToggle]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search Members"
        className={`
          h-7
          rounded
          bg-purple-400 text-black

          transition-all duration-500
          ${open
            ? "w-[320px] px-2 opacity-100"
            : "w-0 px-0 opacity-0"
          }
        `}
      />

      <button
        onClick={() => setOpen(prev => !prev)}
        className="
          h-7 w-10
          rounded
          bg-purple-400
          flex items-center justify-center
          cursor-pointer
        "
      >
        <CiSearch />
      </button>
    </div>
  );
}
