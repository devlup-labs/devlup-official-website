import React, { useEffect, useMemo, useRef, useState } from "react";

/* ================= MAX SPEED ================= */
const MAX_SCROLL_SPEED = 40;
const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

/* ================= TILE ================= */
const Tile = React.memo(function Tile({
  tile,
  TILE_SIZE,
  openTile,
  onCardTransitionEnd,
  tileRefs,
  activeTile
}) {
  return (
    <div
      ref={(el) => (tileRefs.current[tile.id] = el)}
      onClick={(e) => {
        e.stopPropagation();
        openTile(tile.id);
      }}
      className="absolute left-1/2 top-1/2"
    >
      <div
        onTransitionEnd={() => onCardTransitionEnd(tile.id)}
        className="flex items-center justify-center
                   bg-white/10 border border-white/20
                   rounded-full cursor-pointer select-none"
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          backfaceVisibility: "hidden",
          willChange: "transform",
          transform: "translateZ(0)"
        }}
      >
        {tile.label}
      </div>
    </div>
  );
});

/* ================= BLOG ================= */
function Blog() {

  const TEAM = [
    "Aarav","Anabel","Kunal","Sneha","Aditya","Pooja",
    "Rahul","Ananya","Dev","Build","Ship","Scale",
    "Design","Animate","Deploy","Optimize","Grow","Evolve"
  ];

  const RADIUS = 500;
  const TILE_SIZE = 120;
  const ROWS = 5;
  const TILE_GAP = 8;
  const SPLIT_SHIFT = 280;

  const [rotation, setRotation] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [nextTile, setNextTile] = useState(null);
  const [focusProgress, setFocusProgress] = useState(0);

  const userInitiatedRef = useRef(false);
  const tileRefs = useRef({});
  const frameRef = useRef(null);
  const scrollRafRef = useRef(null);
  const wheelRafRef = useRef(null);

  const viewportRef = useRef({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  /* ================= SCROLL ================= */

  useEffect(() => {
    if (activeTile !== null) return;

    let lastScroll = window.scrollY;

    const onScroll = () => {

      let delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;

      delta = clamp(delta, -MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);

      if (scrollRafRef.current)
        cancelAnimationFrame(scrollRafRef.current);

      scrollRafRef.current = requestAnimationFrame(() => {
        setRotation(r => r - delta * 0.12);
      });

    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);

  }, [activeTile]);



  useEffect(() => {

    if (activeTile !== null) return;

    const onWheel = (e) => {

      let deltaX =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
          ? e.deltaY
          : 0;

      if (deltaX === 0) return;

      deltaX = clamp(deltaX, -MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);

      if (wheelRafRef.current)
        cancelAnimationFrame(wheelRafRef.current);

      wheelRafRef.current = requestAnimationFrame(() => {
        setRotation(r => r - deltaX * 0.12);
      });

    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);

  }, [activeTile]);



  /* ================= TILE ENGINE ================= */

  const tiles = useMemo(() => {

    const out = [];
    const angleStep = 360 / TEAM.length;

    let activeAngle = null;
    let activeRow = null;
    let activeIndex = null;

    if (activeTile) {

      const parts = activeTile.split("-").map(Number);
      activeRow = parts[0];
      activeIndex = parts[1];

      const offset = activeRow % 2 ? angleStep / 2 : 0;
      activeAngle = activeIndex * angleStep + offset + rotation;

    }

    for (let row = 0; row < ROWS; row++) {

      for (let i = 0; i < TEAM.length; i++) {

        const offset = row % 2 ? angleStep / 2 : 0;
        const angle = i * angleStep + offset + rotation;

        const rad = (angle * Math.PI) / 180;

        const x = Math.sin(rad) * RADIUS;
        const z = Math.cos(rad) * RADIUS;

        const y =
          (row - (ROWS - 1) / 2) *
          (TILE_SIZE * 0.75 + TILE_GAP);

        let splitX = 0;

        if (activeAngle !== null && `${row}-${i}` !== activeTile) {

          const d = ((angle - activeAngle + 540) % 360) - 180;

          if (Math.abs(d) < 0.0001) {
            splitX = row < activeRow ? -SPLIT_SHIFT : SPLIT_SHIFT;
          }
          else {
            splitX = d < 0 ? -SPLIT_SHIFT : SPLIT_SHIFT;
          }

        }

        out.push({
          id: `${row}-${i}`,
          row,
          index: i,
          label: TEAM[i],
          x, y, z,
          splitX,
          faceRotation: angle,
          zIndex: Math.round(1000 + z)
        });

      }

    }

    return out;

  }, [rotation, activeTile]);



  /* ================= APPLY LAYOUT ================= */

  useEffect(() => {

    tiles.forEach(tile => {

      const wrapper = tileRefs.current[tile.id];
      if (!wrapper) return;

      wrapper.style.zIndex = tile.zIndex;

      const inner = wrapper.firstChild;
      const isActive = tile.id === activeTile;

      const cx = viewportRef.current.w / 2;
      const cy = viewportRef.current.h / 2;

      const tileX = cx + tile.x + tile.splitX;
      const tileY = cy + tile.y;

      let extraX = 0, extraY = 0, extraZ = 0, extraScale = 1;

      if (isActive) {

        extraX = (cx - tileX) * focusProgress;
        extraY = (cy - tileY) * focusProgress;

        extraZ = 260 * focusProgress;
        extraScale = 1 + focusProgress;

      }

      wrapper.style.transform = `
        translateX(-50%)
        translateY(${tile.y}px)
      `;

      inner.style.transition =
        "transform 0.45s cubic-bezier(0.22,1,0.36,1)";

      inner.style.transform = `
        translateX(${tile.x + tile.splitX + extraX}px)
        translateY(${extraY}px)
        translateZ(${tile.z + extraZ}px)
        rotateY(${tile.faceRotation}deg)
        scale(${extraScale})
      `;

    });

  }, [tiles, activeTile, focusProgress]);



  /* ================= CLICK ================= */

  const openTile = React.useCallback((id) => {

    userInitiatedRef.current = true;

    if (id === activeTile) return;

    if (activeTile) {

      setNextTile(id);
      setActiveTile(null);
      setFocusProgress(0);
      return;

    }

    setActiveTile(id);

    const [row, index] = id.split("-").map(Number);

    const angleStep = 360 / TEAM.length;
    const offset = row % 2 ? angleStep / 2 : 0;

    const clickedAngle = index * angleStep + offset + rotation;

    const delta = ((clickedAngle + 540) % 360) - 180;

    const startRotation = rotation;
    const targetRotation = rotation - delta;

    const duration = 400;
    const startTime = performance.now();

    const animate = (time) => {

      const t = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setRotation(startRotation + (targetRotation - startRotation) * eased);
      setFocusProgress(eased);

      if (t < 1)
        frameRef.current = requestAnimationFrame(animate);

    };

    animate(startTime);

  }, [activeTile, rotation]);



  /* ================= AFTER CLOSE ================= */

  const onCardTransitionEnd = React.useCallback((id) => {

    if (
      userInitiatedRef.current &&
      !activeTile &&
      nextTile === id
    ) {

      userInitiatedRef.current = false;
      setNextTile(null);
      openTile(id);

    }

  }, [activeTile, nextTile, openTile]);



  /* ================= CLOSE ================= */

  const closeTile = () => {

    userInitiatedRef.current = false;

    setActiveTile(null);
    setNextTile(null);
    setFocusProgress(0);

  };



  useEffect(() => {

    const onKey = (e) => {

      if (e.key === "Escape" && activeTile)
        closeTile();

    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);

  }, [activeTile]);



  useEffect(() => {

    return () => {

      if (frameRef.current)
        cancelAnimationFrame(frameRef.current);

      if (scrollRafRef.current)
        cancelAnimationFrame(scrollRafRef.current);

      if (wheelRafRef.current)
        cancelAnimationFrame(wheelRafRef.current);

    };

  }, []);



  /* ================= JSX ================= */

  return (

    <section className="relative h-[300vh] bg-black text-white">

      <div
        className="sticky top-0 h-screen overflow-hidden
                   flex items-center justify-center"
        onClick={() => {
          if (activeTile) closeTile();
        }}
      >

        <div
          className="relative w-full h-full"
          style={{ perspective: "1600px" }}
        >

          {tiles.map(tile => (
            <Tile
              key={tile.id}
              tile={tile}
              TILE_SIZE={TILE_SIZE}
              openTile={openTile}
              onCardTransitionEnd={onCardTransitionEnd}
              tileRefs={tileRefs}
              activeTile={activeTile}
            />
          ))}

        </div>

      </div>

    </section>

  );

}

export default Blog;