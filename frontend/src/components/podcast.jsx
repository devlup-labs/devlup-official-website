import { useEffect, useRef, useState } from "react";
import TopControls from "../components/Video/TopControls";

export default function Podcast() {
  const items = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    name: `Character ${i + 1}`,
    role: ["Captain", "Swordsman", "Sniper", "Doctor", "Navigator"][i % 5],
    img: `https://picsum.photos/900/600?random=${i + 1}`,
  }));

  const containerRef = useRef(null);
  const wrapperRef = useRef(null); // 🔥 NEW
  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const raf = useRef(null);
  const lastIndexUpdate = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const friction = 0.93;
  const wheelStrength = 0.0025;
  const snapStrength = 0.08;

  /* =============================
     TRANSFORMS
  ============================= */
  const updateTransforms = () => {
    const cards = containerRef.current?.children;
    if (!cards) return;

    const visibleRange = 6;

    for (let i = 0; i < cards.length; i++) {
      const offset = i - scrollPos.current;

      if (Math.abs(offset) > visibleRange) {
        cards[i].style.opacity = 0;
        cards[i].style.transform = "translateY(9999px) scale(0.5)";
        continue;
      }

      const distance = Math.abs(offset);
      const translateY = offset * 180;
      const scale = 1 - Math.min(distance * 0.12, 0.5);
      const zIndex = Math.round(1000 - distance * 50);

      cards[i].style.transform = `translateY(${translateY}px) scale(${scale})`;
      cards[i].style.opacity = 1;
      cards[i].style.zIndex = zIndex;
    }
  };

  /* =============================
     ANIMATION LOOP
  ============================= */
  const animate = (time) => {
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

    if (time - lastIndexUpdate.current > 80) {
      setActiveIndex(newActive);
      lastIndexUpdate.current = time;
    }

    updateTransforms();

    if (
      Math.abs(velocity.current) > 0.0005 ||
      Math.abs(scrollPos.current - Math.round(scrollPos.current)) > 0.0005
    ) {
      raf.current = requestAnimationFrame(animate);
    } else {
      raf.current = null;
    }
  };

  /* =============================
     WHEEL (IMPORTANT CHANGE)
  ============================= */
  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  let isHoveringCards = false;

  // ✅ Track hover properly
  const handleEnter = () => (isHoveringCards = true);
  const handleLeave = () => (isHoveringCards = false);

  container.addEventListener("mouseenter", handleEnter);
  container.addEventListener("mouseleave", handleLeave);

  const onWheel = (e) => {
    // 👉 If NOT hovering cards → allow normal page scroll
    if (!isHoveringCards) return;

    // 👉 If hovering → animate cards
    e.preventDefault();

    const normalizedDelta =
      Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);

    velocity.current += normalizedDelta * wheelStrength;
    velocity.current = Math.max(-0.15, Math.min(0.15, velocity.current));

    if (!raf.current) {
      raf.current = requestAnimationFrame(animate);
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  raf.current = requestAnimationFrame(animate);

  return () => {
    container.removeEventListener("mouseenter", handleEnter);
    container.removeEventListener("mouseleave", handleLeave);
    window.removeEventListener("wheel", onWheel);
    cancelAnimationFrame(raf.current);
  };
}, []);

  /* =============================
     UI
  ============================= */

  return (
    <div className="[background-image:var(--bg-main-gradient)] bg-[var(--bg-fallback)] text-[var(--text-primary)]">

      {/* 🔥 CONTROLS */}
      <div className="fixed top-1 left-0 w-full flex justify-center z-[3000] pointer-events-none">
        <div className="pointer-events-auto">
          <TopControls />
        </div>
      </div>

      {/* 🔥 ANIMATION AREA (SCROLL LOCKED HERE) */}
      <div
        ref={wrapperRef}
        className="h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between px-16">

          {/* LEFT STACK */}
          <div className="w-full lg:w-[20%] flex items-center justify-start">
            <div
              ref={containerRef}
              className="relative h-[650px] w-[520px] flex items-center justify-center"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    willChange: "transform, opacity",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
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
          <div className="w-full lg:w-[50%] flex items-center justify-end">
            <div className="text-left max-w-md">
              <h2 className="text-4xl font-bold mb-4">
                {items[activeIndex].name}
              </h2>

              <p className="text-xl uppercase tracking-widest text-[var(--text-secondary)]">
                {items[activeIndex].role}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 NORMAL PAGE CONTINUES → FOOTER SAFE */}
      {/* Your footer will now appear BELOW without overlap */}

    </div>
  );
}