import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const Tile = React.memo(({ tile, TILE_SIZE, openTile, tileRefs, isActive, focusProgress }) => {
  const navigate = useNavigate();
  const showProfileUI = isActive && focusProgress > 0.8;

  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/${tile.label.toLowerCase()}`);
  };

  return (
    <div
      ref={(el) => (tileRefs.current[tile.id] = el)}
      className="absolute top-0 left-0"
      style={{ willChange: "transform, opacity", zIndex: isActive ? 5000 : 1 }}
    >
      <div
        onClick={(e) => { e.stopPropagation(); openTile(tile.id); }}
        className={`relative flex flex-col items-center justify-center transition-colors duration-500 ${
          isActive
            ? "rounded-full"
            : "rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-md"
        }`}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          backfaceVisibility: "hidden",
          overflow: "visible"
        }}
      >
        {/* IMAGE */}
        <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
          <img src={tile.img} alt="" className="w-full h-full object-cover opacity-70" />
        </div>

        {/* PROFILE CARD */}
        {isActive && (
          <div
            className="absolute flex flex-col items-center justify-center rounded-full shadow-2xl border backdrop-blur-xl"
            style={{
              width: window.innerWidth < 768 ? '320px' : '420px',
              height: window.innerWidth < 768 ? '320px' : '420px',
              transform: `scale(${focusProgress})`,
              opacity: focusProgress,
              background: "var(--gradient-primary)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)"
            }}
          >
            {showProfileUI && (
              <div className="flex flex-col items-center w-full px-8">

                {/* IMAGE + NAME */}
                <div className="flex flex-row items-start gap-4 mb-2">
                  <div className="w-40 h-40 rounded-full border overflow-hidden flex-shrink-0 -ml-6 shadow-lg border-[var(--border-subtle)]">
                    <img 
                      src={tile.img} 
                      alt={tile.label} 
                      className="w-[125%] h-[125%] object-cover -ml-2 -mt-1" 
                    />
                  </div>

                  <div className="flex flex-col items-center pt-16">
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      {tile.label}
                    </h2>

                    <div className="flex gap-3 text-lg opacity-70">
                      <FontAwesomeIcon icon={faGithub} className="hover:text-[var(--text-secondary)] transition" />
                      <FontAwesomeIcon icon={faEnvelope} className="hover:text-[var(--text-secondary)] transition" />
                      <FontAwesomeIcon icon={faLinkedin} className="hover:text-[var(--text-secondary)] transition" />
                    </div>
                  </div>
                </div>

                {/* ABOUT */}
                <div className="mt-2 border-t pt-3 w-full border-[var(--border-subtle)]">
                  <h4 className="font-bold text-sm mb-2 text-center">
                    About
                  </h4>

                  <p className="text-center text-xs opacity-80 leading-tight">
                    {tile.bio || "Hi everyone! I'm passionate about building innovative tech solutions and scaling impactful products."}
                  </p>
                </div>

                {/* BUTTON */}
                <button
                  onClick={handleViewProfile}
                  className="mt-4 px-6 py-2 text-xs font-bold rounded-lg transition-all active:scale-95"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                >
                  VIEW PROFILE
                </button>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function Team() {
  const IMAGES = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
  ];

  const TEAM_NAMES = ["Priyanshu","Anabel","Kunal","Sneha","Aditya","Pooja","Rahul","Ananya","Dev","Build","Ship","Scale","Design","Animate","Deploy","Optimize","Grow","Evolve"];

  const TEAM = useMemo(() => TEAM_NAMES.map((name, i) => ({
    name,
    img: IMAGES[i % IMAGES.length]
  })), []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const ROWS = 5;
  const TILE_SIZE = isMobile ? 95 : 110; 
  const TILE_GAP = isMobile ? 15 : 20;  
  const RADIUS = isMobile ? 320 : 700;  
  const SPLIT_SHIFT = isMobile ? 200 : 400; 

  const [rotation, setRotation] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [focusProgress, setFocusProgress] = useState(0);

  const tileRefs = useRef({});
  const scrollVelocity = useRef(0);
  const rotationRef = useRef(0);
  const frameRef = useRef(null); 
  const touchStartRef = useRef(0);

  const openTile = (id) => {
    if (activeTile === id) { closeCurrent(); return; }
    if (activeTile) { closeCurrent(() => triggerOpen(id)); } 
    else { triggerOpen(id); }
  };

  const closeCurrent = (callback) => {
    const startTime = performance.now();
    const startVal = focusProgress;
    const run = (time) => {
      const t = Math.min((time - startTime) / 400, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setFocusProgress(startVal * (1 - eased));
      if (t < 1) requestAnimationFrame(run);
      else { setActiveTile(null); if (callback) callback(); }
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
      const t = Math.min((time - startTime) / 600, 1);
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
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollVelocity.current = clamp(scrollVelocity.current + (delta * (isMobile ? 0.02 : 0.01)), -10, 10);
    };

    const handleTouchMove = (e) => {
      if (activeTile) return;
      const touchX = e.touches[0].clientX;
      const delta = (touchStartRef.current - touchX) * (isMobile ? 0.3 : 0.4); 
      rotationRef.current = (rotationRef.current - delta) % 360;
      setRotation(rotationRef.current);
      touchStartRef.current = touchX;
    };

    const update = () => {
      if (Math.abs(scrollVelocity.current) > 0.01) {
        rotationRef.current = (rotationRef.current - scrollVelocity.current) % 360;
        setRotation(rotationRef.current);
        scrollVelocity.current *= 0.96;
      }
      frameRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", (e) => touchStartRef.current = e.touches[0].clientX);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    frameRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [activeTile, isMobile]);

  const tilesData = useMemo(() => {
    const out = [];
    const angleStep = 360 / TEAM.length;
    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < TEAM.length; i++) {
        out.push({
          id: `${row}-${i}`,
          label: TEAM[i].name,
          img: TEAM[i].img,
          baseAngle: i * angleStep + (row % 2 ? angleStep / 2 : 0),
          row
        });
      }
    }
    return out;
  }, [TEAM]);

  useEffect(() => {
    const angleStep = 360 / TEAM.length;
    let activeAngle = null;

    if (activeTile) {
      const [r, idx] = activeTile.split("-").map(Number);
      activeAngle = idx * angleStep + (r % 2 ? angleStep / 2 : 0) + rotation;
    }

    tilesData.forEach((tile) => {
      const wrapper = tileRefs.current[tile.id];
      if (!wrapper) return;

      const inner = wrapper.firstChild;

      const angle = tile.baseAngle + rotation;
      const rad = (angle * Math.PI) / 180;

      const x = Math.sin(rad) * RADIUS;
      const z = Math.cos(rad) * RADIUS;

      const yBase = (tile.row - (ROWS - 1) / 2) * (TILE_SIZE + TILE_GAP);
      const verticalCurve = Math.cos(rad);
      const curvedY = yBase * (verticalCurve > 0 ? Math.sqrt(verticalCurve) : 0);

      let splitX = 0;
      if (activeAngle !== null && tile.id !== activeTile) {
        const d = ((angle - activeAngle + 540) % 360) - 180;
        splitX = (d < 0 ? -SPLIT_SHIFT : SPLIT_SHIFT) * focusProgress;
      }

      const isActive = tile.id === activeTile;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      let exX = 0, exY = 0, exZ = 0;
      if (isActive) {
        exX = -x * focusProgress;
        exY = -curvedY * focusProgress;
        exZ = (isMobile ? 250 : 600 - z) * focusProgress;
      }

      const baseScale = 0.5 + ((z + RADIUS) / (2 * RADIUS)) * 0.5;
      const opacity = isActive ? 1 : Math.max(0, 0.05 + ((z + RADIUS) / (RADIUS * 2)) * 0.95);

      wrapper.style.zIndex = isActive ? 5000 : Math.round(1000 + z);
      wrapper.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      wrapper.style.display = (z > -200 || isActive) ? 'block' : 'none';

      inner.style.transform = `
        translate3d(${x + splitX + exX}px, ${curvedY + exY}px, ${z + exZ}px)
        rotateY(${angle}deg)
        translateX(-50%)
        translateY(-50%)
        scale(${baseScale})
      `;

      inner.style.opacity = opacity;
    });
  }, [rotation, activeTile, focusProgress, isMobile, tilesData]);

  return (
    <section className="relative h-screen [background-image:var(--bg-main-gradient)] bg-[var(--bg-fallback)] text-[var(--text-primary)] overflow-hidden touch-none overscroll-none">
      <div 
        className="w-full h-full relative z-20" 
        onClick={() => activeTile && closeCurrent()} 
        style={{ perspective: isMobile ? "800px" : "1600px" }}
      >
        {tilesData.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            TILE_SIZE={TILE_SIZE}
            openTile={openTile}
            tileRefs={tileRefs}
            isActive={activeTile === tile.id}
            focusProgress={focusProgress}
          />
        ))}
      </div>
    </section>
  );
}

export default Team;