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
   const nameSlug = tile.name.trim().split(' ')[0].toLowerCase();
    navigate(`/${nameSlug}`);
  };

  return (
    <div
      ref={(el) => (tileRefs.current[tile.id] = el)}
      className="absolute top-0 left-0"
       style={{ willChange: "transform", zIndex: isActive ? 5000 : 1 }}
    >
      <div
        onClick={(e) => { e.stopPropagation(); openTile(tile.id); }}
        className={`relative flex flex-col items-center justify-center transition-colors duration-500 ${
          isActive
            ? "rounded-full"
            : "rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-md"
        }`}
      style={{ width: TILE_SIZE, height: TILE_SIZE, backfaceVisibility: "hidden" }}

      >
        {/* THE SMOOTH BAND IMAGE (Always fast) */}
        <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
        <img src={tile.profileImage} alt="" className="w-full h-full object-cover opacity-60" />
           
        </div>

        {/* THE PROFILE CARD OVERLAY (Matches Image 1) */}
        {isActive && (
          <div
            className="absolute flex flex-col items-center justify-center rounded-full shadow-2xl border backdrop-blur-xl"
            style={{
              width: window.innerWidth < 768 ? '320px' : '420px',
              height: window.innerWidth < 768 ? '320px' : '420px',
              transform: `scale(${focusProgress})`,
              opacity: focusProgress,
            
            }}
          >
            {showProfileUI && ( <div className="flex flex-col items-center w-full px-8 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-row items-center gap-4 mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/40 overflow-hidden shadow-lg">
                    <img src={tile.profileImage} alt={tile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-black uppercase leading-tight">{tile.name}</h2>
                    <p className="text-[10px] font-bold opacity-70 uppercase">{tile.designation}</p>
                    <div className="flex gap-3 mt-2 text-lg">
                      <a href={tile.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><FontAwesomeIcon icon={faGithub} /></a>
                      <a href={`mailto:${tile.email}`} onClick={(e) => e.stopPropagation()}><FontAwesomeIcon icon={faEnvelope} /></a>
                      <a href={tile.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><FontAwesomeIcon icon={faLinkedin} /></a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-black/10 pt-3 w-full text-center">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{tile.tag}</span>
                  <p className="text-[11px] leading-tight mt-1 line-clamp-3 px-4">{tile.bio}</p>
                </div>
                <button onClick={handleViewProfile} className="mt-4 px-6 py-2 bg-blue-500 text-white text-[10px] font-bold rounded-full hover:bg-blue-600 transition-all">
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
  const [members, setMembers] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [focusProgress, setFocusProgress] = useState(0);

  const tileRefs = useRef({});
  const rotationRef = useRef(0);
  const scrollVelocity = useRef(0);
  const frameRef = useRef(null); // Fixed the missing ReferenceError
  const touchStartRef = useRef(0);

  useEffect(() => {
    fetch("/data/priyanshu.json")
      .then(res => res.json())
      .then(data => setMembers(Array.isArray(data) ? data : [data]))
      .catch(err => console.error("Error loading JSON:", err));
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const ROWS = 5;
  const TILE_SIZE = isMobile ? 95 : 110; 
  const TILE_GAP = isMobile ? 15 : 20;  
  const RADIUS = isMobile ? 320 : 700;  
  const SPLIT_SHIFT = isMobile ? 200 : 400; 

 

  // RESTORED: Exactly your original friction and scroll logic
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
      else { 
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
    const angleStep = 360 / 18;
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
        scrollVelocity.current *= 0.96; // RESTORED ORIGINAL FRICTION
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
    if (members.length === 0) return [];
    const out = [];
    const COLS = 18; 
    const angleStep = 360 / COLS;
    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < COLS; i++) {
        const member = members[i % members.length];
        out.push({ 
          id: `${row}-${i}`, 
          ...member, 
          baseAngle: i * angleStep + (row % 2 ? angleStep / 2 : 0), 
          row 
        });
      }
    }
    return out;
  }, [members]);

  useEffect(() => {
    if (tilesData.length === 0) return;
    const COLUMNS = 18;
    const angleStep = 360 / COLUMNS;
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
        className="w-full h-full relative" 
        onClick={() => activeTile && closeCurrent()} 
        style={{ perspective: "1200px" }}
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