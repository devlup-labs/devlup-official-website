import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { getTeam } from "../api/services";
import { CiSearch } from "react-icons/ci";
import { FaTags } from "react-icons/fa";
import { ThemeContext } from "../App";

const Tile = React.memo(({ tile, TILE_SIZE, openTile, tileRefs, isActive, focusProgress }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const showProfileUI = isActive && focusProgress > 0.8;
  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/portfolio/${tile.memberId}`); // use member_id
  };

  const getBorderColor = (designation = "") => {
    const role = designation.toLowerCase();

    if (role.includes("core")) return "#3ba8f6";
    if (role.includes("coordinator")) return "#bcb613";
    if (role.includes("mentor")) return "#3db910";
    if (role.includes("alumni")) return "#f5690b";

    return "#E5E7EB"; // default gray
  };

  return (
    <div
      ref={(el) => (tileRefs.current[tile.id] = el)}
      className="absolute top-0 left-0"
      style={{ willChange: "transform", zIndex: isActive ? 5000 : 1 }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!tile.isEmpty) openTile(tile.id);
        }}
        className={`relative flex flex-col items-center justify-center transition-colors duration-500 ${isActive
            ? "rounded-full"
            : "rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-md"
          }`}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          backfaceVisibility: "hidden",
          border: `3px solid ${tile.isEmpty ? "#E5E7EB" : getBorderColor(tile.designation)}`,
          boxShadow: tile.isEmpty
            ? "none"
            : `0 0 10px ${getBorderColor(tile.designation)}80`
        }}

      >
        {/* THE SMOOTH BAND IMAGE (Always fast) */}
        <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
          <img
            src={tile.isEmpty ? "https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" : tile.profileImage}
            alt={tile.name || "default"}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>

        {/* THE PROFILE CARD OVERLAY (Matches Image 1) */}
        {isActive && !tile.isEmpty && (
          <div
            className="absolute flex flex-col items-center justify-center rounded-full shadow-2xl border backdrop-blur-xl"
            style={{
              width: window.innerWidth < 768 ? '320px' : '420px',
              height: window.innerWidth < 768 ? '320px' : '420px',
              transform: `scale(${focusProgress})`,
              opacity: focusProgress,
              border: `3px solid ${tile.isEmpty ? "#E5E7EB" : getBorderColor(tile.designation)}`,

            }}
          >
            {showProfileUI && (<div className="flex flex-col items-center w-full px-8 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-row items-center gap-4 mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/40 overflow-hidden shadow-lg">
                  {!profileImageLoaded && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                  <img
                    src={tile.profileImage}
                    alt={tile.name}
                    className="w-full h-full object-cover"
                    onLoad={() => setProfileImageLoaded(true)}
                    onError={() => setProfileImageLoaded(true)}
                  />
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
              <button onClick={handleViewProfile} className="mt-4 px-6 py-2 bg-[var(--bg-muted)] text-white text-[10px] font-bold rounded-full hover:bg-[var(--bg-muted)] transition-all">
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { hamburgerOpen, setHamburgerOpen } = useContext(ThemeContext);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (hamburgerOpen && (searchOpen || filterOpen)) {
      setSearchOpen(false);
      setFilterOpen(false);
    }
  }, [hamburgerOpen]);

  useEffect(() => {
    if ((searchOpen || filterOpen) && hamburgerOpen) {
      setHamburgerOpen(false);
    }
  }, [searchOpen, filterOpen]);

  const tileRefs = useRef({});
  const sectionRef = useRef(null);
  const rotationRef = useRef(0);
  const initialRotationRef = useRef(0);
  const scrollBaseRotationRef = useRef(0);
  const horizontalOffsetRef = useRef(0);
  const touchStartRef = useRef(0);
  const isTouchingRef = useRef(false);
  const MAX_SCROLL_ROTATION = 360; // Faster, standard single complete sweep

  useEffect(() => {
    getTeam()
      .then(res => {
        const formatted = res.data.data.map(item => ({
          memberId: item.member_id,
          name: item.member_name,
          profileImage: item.member_image,
          rollNumber: item.member_roll_number,
          designation: item.member_designation,
          tag: item.member_tag,
          bio: item.member_about,
          github: item.member_github_id, // already full URL ✅
          linkedin: item.member_linkedin,
          email: item.member_email
        }));;

        setMembers(formatted);
      })
      .catch(err => console.error("API error:", err));
  }, []);

  const HORIZONTAL_WHEEL_FACTOR = isMobile ? 0.25 : 0.35;
  const HORIZONTAL_TOUCH_FACTOR = isMobile ? 0.8 : 1;
  const ROWS = 4;
  const COLS = 14;
  const TILE_SIZE = isMobile ? 120 : 160;
  const TILE_GAP = isMobile ? 20 : 30;
  const RADIUS = isMobile ? 320 : 700;
  const SPLIT_SHIFT = isMobile ? 200 : 400;



  // RESTORED: Exactly your original friction and scroll logic
  const openTile = (id) => {
    setSearchOpen(false);
    setFilterOpen(false);
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
    setActiveTile(id);
    animateToCenter(id);
  };

  const animateToCenter = (id) => {
    const [row, index] = id.split("-").map(Number);
    const angleStep = 360 / COLS;
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

  const snapToMember = (id) => {
    const [row, index] = id.split("-").map(Number);
    const angleStep = 360 / COLS;
    const offset = row % 2 ? angleStep / 2 : 0;
    const targetPosAngle = (index * angleStep + offset);
    const currentRot = scrollBaseRotationRef.current + horizontalOffsetRef.current;

    let delta = (-targetPosAngle - currentRot) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const startOffset = horizontalOffsetRef.current;
    const startTime = performance.now();
    const run = (time) => {
      const t = Math.min((time - startTime) / 800, 1);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart

      horizontalOffsetRef.current = startOffset + (delta * eased);
      rotationRef.current = scrollBaseRotationRef.current + horizontalOffsetRef.current;
      setRotation(rotationRef.current);

      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      const match = tilesData.find(t => !t.isEmpty && t.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      if (match) {
        snapToMember(match.id);
      }
    }
  };

  useEffect(() => {
    const applyRotation = () => {
      rotationRef.current = scrollBaseRotationRef.current + horizontalOffsetRef.current;
      setRotation(rotationRef.current);
    };

    const onScroll = () => {
      if (activeTile) return;

      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const totalScrollable = sectionEl.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const rect = sectionEl.getBoundingClientRect();
      const passed = Math.max(0, Math.min(totalScrollable, -rect.top));
      const progress = passed / totalScrollable;
      const extraRotation = progress * MAX_SCROLL_ROTATION;

      scrollBaseRotationRef.current = initialRotationRef.current - extraRotation;
      applyRotation();
    };

    const onWheel = (e) => {
      if (activeTile) return;

      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      const rect = sectionRef.current?.getBoundingClientRect();
      const inView = !!rect && rect.bottom > 0 && rect.top < window.innerHeight;
      if (!inView) return;

      horizontalOffsetRef.current -= e.deltaX * HORIZONTAL_WHEEL_FACTOR;
      applyRotation();
    };

    const onTouchStart = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!inView) return;

      isTouchingRef.current = true;
      touchStartRef.current = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
      if (activeTile || !isTouchingRef.current) return;

      const currentX = e.touches[0].clientX;
      const delta = (touchStartRef.current - currentX) * HORIZONTAL_TOUCH_FACTOR;
      touchStartRef.current = currentX;

      horizontalOffsetRef.current -= delta;
      applyRotation();
    };

    const onTouchEnd = () => {
      isTouchingRef.current = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [activeTile, HORIZONTAL_TOUCH_FACTOR, HORIZONTAL_WHEEL_FACTOR]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      let tags = m.designation || m.tag || "";
      if (typeof tags === 'string') {
        tags = [tags.trim()];
      }
      return selectedTags.length === 0 || tags.some(tag => selectedTags.includes(tag));
    });
  }, [members, selectedTags]);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    members.forEach((m) => {
      if (m.designation) tagSet.add(m.designation.trim());
      else if (m.tag) tagSet.add(m.tag.trim());
    });
    return Array.from(tagSet);
  }, [members]);

  const tilesData = useMemo(() => {
    const out = [];
    const angleStep = 360 / COLS;

    // ⭐ Only use front half columns (visible initially)
    const FRONT_COLS = Math.floor(COLS / 2); // 9
    const TOTAL_VISIBLE = ROWS * FRONT_COLS;

    // center within visible tiles
    const startIndex = Math.floor((TOTAL_VISIBLE - filteredMembers.length) / 2);

    let visibleCounter = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < COLS; i++) {
        const isFront = i < FRONT_COLS; // ⭐ front half

        let member = null;

        if (isFront) {
          if (
            visibleCounter >= startIndex &&
            visibleCounter < startIndex + filteredMembers.length
          ) {
            member = filteredMembers[visibleCounter - startIndex];
          }
          visibleCounter++;
        }

        out.push({
          id: `${row}-${i}`,
          ...(member || {}),
          isEmpty: !member,
          baseAngle: i * angleStep + (row % 2 ? angleStep / 2 : 0),
          row
        });
      }
    }

    return out;
  }, [filteredMembers]);

  // 4. ⭐ ADD YOUR ROTATION FIX HERE (RIGHT AFTER tilesData)
  useEffect(() => {
    if (members.length === 0) return;

    const FRONT_COLS = Math.floor(COLS / 2);
    const angleStep = 360 / COLS;

    const TOTAL_VISIBLE = ROWS * FRONT_COLS;
    const startIndex = Math.floor((TOTAL_VISIBLE - members.length) / 2);

    const firstVisibleIndex = startIndex;

    const row = Math.floor(firstVisibleIndex / FRONT_COLS);
    const colInFront = firstVisibleIndex % FRONT_COLS;

    const actualCol = colInFront;

    const offset = row % 2 ? angleStep / 2 : 0;

    const targetAngle = actualCol * angleStep + offset;

    const newRotation = -targetAngle;

    initialRotationRef.current = newRotation;
    scrollBaseRotationRef.current = newRotation;
    rotationRef.current = scrollBaseRotationRef.current + horizontalOffsetRef.current;
    setRotation(rotationRef.current);

  }, [members]);

  useEffect(() => {
    if (tilesData.length === 0) return;
    const angleStep = 360 / COLS;
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

      const cx = isMobile ? window.innerWidth / 2 : window.innerWidth / 2 - 70;
      const cy = isMobile ? window.innerHeight / 2 : window.innerHeight / 2 + 10;

      let exX = 0, exY = 0, exZ = 0;
      if (isActive) {
        exX = -x * focusProgress;
        exY = -curvedY * focusProgress;
        exZ = (isMobile ? 280 : 600 - z) * focusProgress;
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
    <section ref={sectionRef} className="relative h-[300vh]">
      {/* SEARCH AND FILTER CONTROLS - Fixed below header */}
      <div
        className="fixed left-0 right-0 z-[1001] flex gap-3 items-center justify-center py-1 w-full pointer-events-none"
        style={{ top: isMobile ? "90px" : "100px", background: "transparent" }}
      >
        {/* SEARCH BAR */}
        <div className="flex items-center relative pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          <div
            className={`
              flex items-center
              bg-[var(--bg-muted)]
              border border-[var(--border-subtle)]
              rounded-full
              transition-all duration-500 ease-out
              pointer-events-auto
              ${searchOpen
                ? (isMobile ? "w-[calc(100vw-80px)] h-10 px-4 justify-start" : "w-[300px] h-10 px-4 justify-start")
                : "w-10 h-10 justify-center"
              }
            `}
            onMouseDown={(e) => e.stopPropagation()}
          >
              <CiSearch
                className="text-white cursor-pointer shrink-0 pointer-events-auto"
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  const newState = !searchOpen;
                  setSearchOpen(newState);
                  if (newState && isMobile) setFilterOpen(false);
                }}
              />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              className={`
                bg-transparent border-none outline-none
                text-white text-sm
                transition-all duration-300
                pointer-events-auto
                ${searchOpen
                  ? "w-full ml-3 opacity-100"
                  : "w-0 opacity-0"
                }
              `}
              autoComplete="off"
            />
          </div>
        </div>

        {/* FILTER BUTTON */}
        <div className="pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          <div
            className={`
              flex items-center overflow-visible
              bg-[var(--bg-muted)] backdrop-blur-md border border-white/10
              transition-all ease-in-out ${hamburgerOpen ? "duration-0" : "duration-500"}
              pointer-events-auto
              ${filterOpen ? "pr-3" : ""}
              rounded-full
            `}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newState = !filterOpen;
                setFilterOpen(newState);
                if (newState && isMobile) setSearchOpen(false);
              }}
              className={`
                flex items-center justify-center text-white
                w-10 h-10 md:w-auto md:px-4
                transition-all duration-300 cursor-pointer
                pointer-events-auto
              `}
            >
              <FaTags size={16} />
              <span className={`ml-2 text-xs text-white font-medium hidden md:block transition-opacity duration-300 ${filterOpen ? "opacity-100" : "opacity-100"}`}>
                Filters
              </span>
            </button>

            {/* TAGS */}
            <div
              className={`
                flex items-center gap-2
                transition-all ease-in-out ${hamburgerOpen ? "duration-0" : "duration-500"}
                pointer-events-auto
                ${filterOpen ? "max-w-[800px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
                overflow-hidden
              `}
            >
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap transition-colors pointer-events-auto ${selectedTags.includes(tag)
                      ? "bg-white/30 text-white font-semibold"
                      : "text-white hover:text-white hover:bg-white/10"
                    }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedTags([]); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-3 py-1 rounded-full text-[10px] md:text-xs transition-colors whitespace-nowrap pointer-events-auto text-red-300 hover:bg-white/10 hover:text-red-200 ml-2"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="sticky top-0 h-screen w-full text-[var(--text-primary)] overflow-hidden"
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