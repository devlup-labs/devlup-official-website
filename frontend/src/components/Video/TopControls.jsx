import { useState, useContext, useEffect } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import { ThemeContext } from "../../App";

export default function TopControls({
  searchTerm = "",
  setSearchTerm = () => { },
  selectedTags = [],
  setSelectedTags = () => { },
  tags = []
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { hamburgerOpen, setHamburgerOpen } = useContext(ThemeContext);

  // Close search and filter when hamburger opens
  useEffect(() => {
    if (hamburgerOpen && (searchOpen || filterOpen)) {
      setSearchOpen(false);
      setFilterOpen(false);
    }
  }, [hamburgerOpen]);

  // Close hamburger when search or filter opens
  useEffect(() => {
    if ((searchOpen || filterOpen) && hamburgerOpen) {
      setHamburgerOpen(false);
    }
  }, [searchOpen, filterOpen]);

  let glideClass = "";

  if (searchOpen && !filterOpen) {
    glideClass = "";
  } else if (!searchOpen && filterOpen) {
    glideClass = "";
  } else if (searchOpen && filterOpen) {
    glideClass = "";
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleSetSearchOpen = (val) => {
    setSearchOpen(val);
    if (val && isMobile) setFilterOpen(false);
  };

  const handleSetFilterOpen = (val) => {
    setFilterOpen(val);
    if (val && isMobile) setSearchOpen(false);
  };

  return (
    <div
      className={`relative z-[50000] pointer-events-none ${glideClass} flex justify-center items-center gap-[14px] p-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
    >
      <SearchBar
        searchOpen={searchOpen}
        setSearchOpen={handleSetSearchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <FilterButton
        filterOpen={filterOpen}
        setFilterOpen={handleSetFilterOpen}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        tags={tags}
      />
    </div>
  );
}


