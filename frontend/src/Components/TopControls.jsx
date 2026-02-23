import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import "./TopControls.css";

export default function TopControls() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  let glideClass = "";

  if (searchOpen && !filterOpen) {
    glideClass = "glide-search";
  } else if (!searchOpen && filterOpen) {
    glideClass = "glide-filter";
  } else if (searchOpen && filterOpen) {
    glideClass = "glide-both";
  }

  return (
    <div className={`topControls ${glideClass}`}>
      <SearchBar onToggle={setSearchOpen} />
      <FilterButton onToggle={setFilterOpen} />
    </div>
  );
}
