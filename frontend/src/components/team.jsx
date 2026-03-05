import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const Tile = React.memo(({ tile, TILE_SIZE, openTile, tileRefs }) => (
  <div
    ref={(el) => (tileRefs.current[tile.id] = el)}
    className="absolute top-0 left-0"
    style={{ willChange: "transform, opacity", pointerEvents: tile.isBack ? 'none' : 'auto' }}
  >
    <div
      onClick={(e) => { e.stopPropagation(); openTile(tile.id); }}
      className="flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-full cursor-pointer select-none text-[10px] font-bold backdrop-blur-md text-center shadow-xl hover:border-white/50 transition-colors overflow-hidden"
      style={{
        width: TILE_SIZE, height: TILE_SIZE,
        transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Added Image Background */}
      <img src={tile.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <span className="relative z-10 bg-black/40 px-2 py-1 rounded-full text-white">{tile.label}</span>
    </div>
  </div>
));

function Team() {
  // Array of random portrait images
  const IMAGES = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"
  ];

  const TEAM_NAMES = ["Aarav", "Anabel", "Kunal", "Sneha", "Aditya", "Pooja", "Rahul", "Ananya", "Dev", "Build", "Ship", "Scale", "Design", "Animate", "Deploy", "Optimize", "Grow", "Evolve"];
  
  const TEAM = useMemo(() => TEAM_NAMES.map((name, i) => ({
    name,
    img: IMAGES[i % IMAGES.length]
  })), []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const ROWS = 5;
  const TILE_SIZE = isMobile ? 85 : 110; 
  const TILE_GAP = isMobile ? 12 : 20;  
  const RADIUS = isMobile ? 350 : 650;  
  const SPLIT_SHIFT = isMobile ? 240 : 250; 

  const SCROLL_SENSITIVITY = isMobile ? 0.015 : 0.01; 
  const MAX_VELOCITY = 10; 
  const FRICTION = 0.95; 

  const [rotation, setRotation] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [focusProgress, setFocusProgress] = useState(0);

  const tileRefs = useRef({});
  const scrollVelocity = useRef(0);
  const rotationRef = useRef(0);
  const frameRef = useRef(null); 
  const touchStartRef = useRef(0);

  // --- NEW LOGIC: ONE CLOSE THEN OTHER OPEN ---
  const openTile = (id) => {
    if (activeTile === id) {
      closeCurrent();
      return;
    }
    
    if (activeTile) {
      closeCurrent(() => triggerOpen(id));
    } else {
      triggerOpen(id);
    }
  };

  const closeCurrent = (callback) => {
    const startTime = performance.now();
    const startVal = focusProgress;
    const run = (time) => {
      const t = Math.min((time - startTime) / 400, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = startVal * (1 - eased);
      setFocusProgress(val);
      if (t < 1) {
        requestAnimationFrame(run);
      } else {
        setActiveTile(null);
        if (callback) callback();
      }
    };
    requestAnimationFrame(run);
  };

  const triggerOpen = (id) => {
    scrollVelocity.current = 0;
    setActiveTile(id);
    animateToCenter(id);
  };

  const animateToCenter = (id) => {
    const [row, index] = id.split("-").map(Number);
    const angleStep = 360 / TEAM.length;
    const offset = row % 2 ? angleStep / 2 : 0;
    const targetPosAngle = (index * angleStep + offset);
    const combinedAngle = (targetPosAngle + rotationRef.current) % 360;
    let delta = ((combinedAngle + 540) % 360) - 180;

    const startRot = rotationRef.current;
    const startTime = performance.now();
    const run = (time) => {
      const t = Math.min((time - startTime) / 700, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      rotationRef.current = startRot - delta * eased;
      setRotation(rotationRef.current);
      setFocusProgress(eased);
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (activeTile) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollVelocity.current = clamp(scrollVelocity.current + (delta * SCROLL_SENSITIVITY), -MAX_VELOCITY, MAX_VELOCITY);
    };

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
      scrollVelocity.current = 0; 
    };

    const handleTouchMove = (e) => {
      if (activeTile) return;
      const touchX = e.touches[0].clientX;
      const delta = (touchStartRef.current - touchX) * (isMobile ? 0.5 : 0.4); 
      rotationRef.current = (rotationRef.current - delta) % 360;
      setRotation(rotationRef.current);
      touchStartRef.current = touchX;
    };

    const update = () => {
      if (Math.abs(scrollVelocity.current) > 0.01) {
        rotationRef.current = (rotationRef.current - scrollVelocity.current) % 360;
        setRotation(rotationRef.current);
        scrollVelocity.current *= FRICTION;
      }
      frameRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    frameRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [activeTile, isMobile]);

  const tiles = useMemo(() => {
    const out = [];
    const angleStep = 360 / TEAM.length;
    let activeAngle = null;
    if (activeTile) {
      const [r, idx] = activeTile.split("-").map(Number);
      activeAngle = idx * angleStep + (r % 2 ? angleStep / 2 : 0) + rotation;
    }

    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < TEAM.length; i++) {
        const angle = i * angleStep + (row % 2 ? angleStep / 2 : 0) + rotation;
        const rad = (angle * Math.PI) / 180;
        const x = Math.sin(rad) * RADIUS;
        const z = Math.cos(rad) * RADIUS;
        const y = (row - (ROWS - 1) / 2) * (TILE_SIZE + TILE_GAP);
        const hRatio = Math.abs(x) / RADIUS;
        const curvedY = y * (1 - hRatio * (isMobile ? 0.35 : 0.45));
        
        // VIBRATION FIX: We scale splitX by focusProgress so it slides, doesn't jump
        let splitX = 0;
        if (activeAngle !== null && `${row}-${i}` !== activeTile) {
          const d = ((angle - activeAngle + 540) % 360) - 180;
          const targetSplit = d < 0 ? -SPLIT_SHIFT : SPLIT_SHIFT;
          splitX = targetSplit * focusProgress; 
        }

        out.push({
          id: `${row}-${i}`, label: TEAM[i].name, img: TEAM[i].img, x, curvedY, z, splitX,
          faceRotation: angle, baseScale: 0.5 + ((z + RADIUS) / (2 * RADIUS)) * 0.5,
          isBack: z < 0, zIndex: Math.round(1000 + z)
        });
      }
    }
    return out;
  }, [rotation, activeTile, isMobile, RADIUS, TILE_SIZE, focusProgress]);

  useEffect(() => {
    tiles.forEach((tile) => {
      const wrapper = tileRefs.current[tile.id];
      if (!wrapper) return;
      const inner = wrapper.firstChild;
      const isActive = tile.id === activeTile;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      let exX = 0, exY = 0, exZ = 0, exScale = 0;
      if (isActive) {
        exX = -tile.x * focusProgress; 
        exY = -tile.curvedY * focusProgress;
        exZ = (isMobile ? 350 : 600 - tile.z) * focusProgress;
        exScale = focusProgress * (isMobile ? 1.3 : 0.9);
      }

      wrapper.style.zIndex = tile.zIndex;
      wrapper.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      inner.style.transform = `translate3d(${tile.x + tile.splitX + exX}px, ${tile.curvedY + exY}px, ${tile.z + exZ}px) rotateY(${tile.faceRotation}deg) translateX(-50%) translateY(-50%) scale(${tile.baseScale + exScale})`;
      inner.style.opacity = isActive ? 1 : Math.max(0, 0.05 + ((tile.z + RADIUS) / (RADIUS * 2)) * 0.95);
    });
  }, [tiles, activeTile, focusProgress, isMobile, RADIUS]);

  return (
    <section className="relative h-screen bg-black text-white transition-colors duration-500 overflow-hidden overscroll-none">
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_95%)]" />
      
      <div 
        className="w-full h-full relative z-20" 
        onClick={() => activeTile && closeCurrent()} 
        style={{ perspective: "1600px" }}
      >
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} TILE_SIZE={TILE_SIZE} openTile={openTile} tileRefs={tileRefs} />
        ))}
      </div>
    </section>
  );
}

export default Team;