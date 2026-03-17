import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center relative group z-200 ">
      <div className={`
        flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-full transition-all duration-500 ease-out
        ${open ? "w-[300px] px-4 ring-2 ring-purple-500/50" : "w-10 px-0"}
      `}>
        <CiSearch className="text-white min-w-[20px] cursor-pointer" onClick={() => setOpen(!open)} size={20} />
        <input
          type="text"
          placeholder="Search..."
          className={`
            bg-transparent border-none outline-none text-white text-sm transition-all duration-300
            ${open ? "w-full ml-3 opacity-100" : "w-0 opacity-0"}
          `}
        />
      </div>
    </div>
  );
}