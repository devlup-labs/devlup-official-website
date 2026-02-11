import { useState, useEffect } from "react";
import { FaTags } from "react-icons/fa";

export default function FilterButton({ onToggle }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onToggle(open);
  }, [open, onToggle]);

  return (
    <div className="relative inline-flex items-center z-[5000]">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="
          h-7 w-[60px]
          rounded
          bg-purple-600
          text-gray-200 text-xs
          cursor-pointer
          flex items-center justify-center
        "
      >
        <FaTags size={18} />
      </button>

      {open && (
        <div
          className="
            absolute
            left-[calc(100%+10px)]
            top-1/2 -translate-y-1/2

            w-[380px] max-h-10
            flex gap-2 p-2

            bg-black rounded
            shadow-lg

            overflow-x-auto overflow-y-hidden
            z-[6000]
          "
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="
                px-2 py-1
                bg-slate-900
                text-gray-200 text-xs
                rounded
                whitespace-nowrap
                cursor-pointer
                transition
                hover:bg-slate-700 hover:-translate-y-[2px]
              "
            >
              Tag {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
