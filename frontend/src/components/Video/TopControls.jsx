import { useState, useContext, useEffect } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import { ThemeContext } from "../../App";
import "./TopControls.css";

export default function TopControls({
  searchTerm = "",
  setSearchTerm = () => {},
  selectedTag = "All",
  setSelectedTag = () => {},
  tags = ["All"]
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
    glideClass = "glide-search";
  } else if (!searchOpen && filterOpen) {
    glideClass = "glide-filter";
  } else if (searchOpen && filterOpen) {
    glideClass = "glide-both";
  }

  return (
    <div className={`topControls relative z-[50000] pointer-events-none ${glideClass}`}>
      <SearchBar 
        searchOpen={searchOpen} 
        setSearchOpen={setSearchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <FilterButton 
        filterOpen={filterOpen} 
        setFilterOpen={setFilterOpen}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={tags}
      />
    </div>
  );
}


