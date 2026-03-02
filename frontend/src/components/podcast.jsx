import { useEffect, useRef, useState } from "react";

export default function Podcast() {
  const items = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    name: `Character ${i + 1}`,
    role: ["Captain", "Swordsman", "Sniper", "Doctor", "Navigator"][i % 5],
    img: `https://picsum.photos/900/600?random=${i + 1}`,
  }));

  const containerRef = useRef(null);
  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const raf = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const friction = 0.93;
  const wheelStrength = 0.0014;
  const snapStrength = 0.08;

  /* =============================
     STACK TRANSFORMS
  ============================= */
  const updateTransforms = () => {
    const cards = containerRef.current?.children;
    if (!cards) return;

    for (let i = 0; i < cards.length; i++) {
      const offset = i - scrollPos.current;
      const distance = Math.abs(offset);

      const translateY = offset * 180;
      const scale = 1 - Math.min(distance * 0.12, 0.5);
      const opacity = Math.max(1 - distance * 0.4, 0);

      // FIXED stacking logic
      const zIndex = Math.round(1000 - distance * 50);

      cards[i].style.transform = `
        translateY(${translateY}px)
        scale(${scale})
      `;
      cards[i].style.opacity = opacity;
      cards[i].style.zIndex = zIndex;
    }
  };

  /* =============================
     ANIMATION LOOP
  ============================= */
  const animate = () => {
    velocity.current *= friction;
    scrollPos.current += velocity.current;

    scrollPos.current = Math.max(
      0,
      Math.min(items.length - 1, scrollPos.current)
    );

    if (Math.abs(velocity.current) < 0.002) {
      const nearest = Math.round(scrollPos.current);
      scrollPos.current += (nearest - scrollPos.current) * snapStrength;
    }

    const newActive = Math.round(scrollPos.current);
    setActiveIndex((prev) => (prev !== newActive ? newActive : prev));

    updateTransforms();
    raf.current = requestAnimationFrame(animate);
  };

  /* =============================
     WHEEL
  ============================= */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      velocity.current += e.deltaY * wheelStrength;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    raf.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  /* =============================
     UI
  ============================= */
  return (
    <div className="min-h-screen pt-28 flex flex-col lg:flex-row items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">
      
      {/* LEFT STACK */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative h-[650px] w-[520px] flex items-center justify-center"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute w-[520px] h-[320px] rounded-2xl overflow-hidden shadow-[0_10px_40px_var(--shadow-color)]"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT INFO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">
            {items[activeIndex].name}
          </h2>

          <p className="text-xl uppercase tracking-widest text-[var(--text-secondary)]">
            {items[activeIndex].role}
          </p>
        </div>
      </div>
    </div>
  );
}