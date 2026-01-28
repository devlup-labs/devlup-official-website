import { useState, useEffect } from "react";
import styles from "./FilterButton.module.css";
import { FaTags } from "react-icons/fa";

export default function FilterButton({ onToggle }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onToggle(open);
  }, [open, onToggle]);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={() => setOpen(prev => !prev)}
      >
        <FaTags size={18} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className={styles.item}>
              Tag {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
