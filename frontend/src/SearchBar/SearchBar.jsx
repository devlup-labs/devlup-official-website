import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import styles from "./SearchBar.module.css";

export default function SearchBar({ onToggle }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onToggle(open);
  }, [open, onToggle]);

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="Search Members"
        className={`${styles.input} ${open ? styles.show : ""}`}
      />

      <button
        className={styles.button}
        onClick={() => setOpen(prev => !prev)}
      >
        <CiSearch />
      </button>
    </div>
  );
}
