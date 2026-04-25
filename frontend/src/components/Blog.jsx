import { useEffect, useRef, useMemo, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import { getBlogs } from "../api/services.js";
import { CiSearch } from "react-icons/ci";
import { FaTags } from "react-icons/fa";
import { ThemeContext } from "../App";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function Blog() {
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const smoothProgress = useRef(0);
  const tickingRef = useRef(false);
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { hamburgerOpen, setHamburgerOpen } = useContext(ThemeContext);

  const layers = useMemo(() => {
    // Filter blogs based on search and selected tag
    let filteredBlogs = blogs.filter((card) => {
      const titleMatch = card.blog_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const authorMatch = card.blog_author?.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = titleMatch || authorMatch;

      let tags = card.blog_tags || [];
      if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(t => t);
      }

      const tagMatch = selectedTags.length === 0 || tags.some(tag => selectedTags.includes(tag));

      return searchMatch && tagMatch;
    });

    return filteredBlogs.map((card, i) => {
      const angle = i * GOLDEN_ANGLE;
      const radius = 20 + Math.random() * 30;

      // Ensure tags is always an array
      let tags = card.blog_tags || [];
      if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(t => t);
      }

      return {
        id: i,
        blog_id: card.blog_id,
        title: card.blog_title,
        image: card.blog_thumbnail,
        author: card.blog_author,
        date: card.blog_date,
        tags: tags,
        instagram: "#",
        github: "#",
        linkedin: "#",
        rx: Math.cos(angle) * radius,
        ry: Math.sin(angle) * radius,
        baseScale: 0.2,
      };
    });
  }, [blogs, searchTerm, selectedTags]);

  // Extract all unique tags from blogs
  const allTags = useMemo(() => {
    const tagSet = new Set();
    blogs.forEach((blog) => {
      let tags = blog.blog_tags || [];
      if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(t => t);
      }
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [blogs]);

  const searchInputRef = useRef(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search and filter when hamburger opens
  useEffect(() => {
    if (hamburgerOpen && (searchOpen || filterOpen)) {
      setSearchOpen(false);
      setFilterOpen(false);
    }
  }, [hamburgerOpen]);

  // Close hamburger when search or filter opens
  useEffect(() => {
    if ((searchOpen || filterOpen) && hamburgerOpen) {
      setHamburgerOpen(false);
    }
  }, [searchOpen, filterOpen]);

  const navigate = useNavigate();
  /* ================= OPTIMIZED ANIMATION ================= */

  useEffect(() => {
    const viewportHeight = window.innerHeight;

    const updateCards = () => {
      const section = sectionRef.current;
      if (!section) {
        tickingRef.current = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      let progress = 0;

      if (rect.bottom < 0) {
        progress = 1;
      } else if (rect.top > viewportHeight) {
        progress = 0;
      } else {
        progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      }

      const diff = progress - smoothProgress.current;
      const easing = Math.abs(diff) > 0.2 ? 0.22 : 0.12;
      smoothProgress.current += diff * easing;

      const hasActive = activeCard !== null;
      const _isMobile = window.innerWidth < 768;
      const maxScale = _isMobile ? 1.2 : 1.8;
      const mobileFactorX = _isMobile ? 0.35 : 1;
      const mobileFactorY = _isMobile ? 0.55 : 1;

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const card = cardRefs.current[i];
        if (!card) continue;

        if (hasActive) {
          if (i === activeCard) {
            card.style.opacity = "1";
            card.style.pointerEvents = "auto";
          } else {
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
          }
          continue;
        }

        card.style.opacity = "1";

        const depth = i / layers.length;
        const windowSize = 0.18;
        const localProgress = (smoothProgress.current - depth) / windowSize;
        const clamped = Math.min(localProgress, 1);

        const scale = layer.baseScale + clamped * maxScale;

        let x = layer.rx * mobileFactorX * clamped;
        let y = layer.ry * mobileFactorY * clamped;

        if (localProgress > 1) {
          const exit = localProgress - 1;
          x += layer.rx * mobileFactorX * exit * 3;
          y += layer.ry * mobileFactorY * exit * 3;
        }

        let blur = 0;
        if (localProgress < 0.25) {
          blur = Math.min(Math.round((0.25 - localProgress) * 6), 4);
        }

        const clickable = blur < 1.5;

        const zIndex =
          (layers.length - i) * 1000 - Math.floor(localProgress * 10);

        const transformValue = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, 0) scale(${scale})`;

        if (card._t !== transformValue) {
          card.style.transform = transformValue;
          card._t = transformValue;
        }

        if (card._b !== blur) {
          card.style.filter = `blur(${blur}px)`;
          card._b = blur;
        }

        card.style.zIndex = zIndex;
        card.style.pointerEvents = clickable ? "auto" : "none";
      }

      if (Math.abs(diff) > 0.001) {
        requestAnimationFrame(updateCards);
      } else {
        smoothProgress.current = progress;
        tickingRef.current = false;
      }
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateCards);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    tickingRef.current = true;
    requestAnimationFrame(updateCards);

    return () => window.removeEventListener("scroll", onScroll);
  }, [layers, activeCard]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActiveCard(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
  useEffect(() => {
    console.log("🚀 Starting to fetch blogs from admin panel...");
    console.log("API baseURL check:", window.location.href);

    getBlogs()
      .then((res) => {
        console.log("📨 Full response object:", res);
        console.log("Response status:", res.status);
        console.log("Response headers:", res.headers);
        console.log("Response data:", res.data);
        console.log("Response data.data:", res.data?.data);

        // Get blog data from API - try multiple paths
        let blogData = res.data?.data;

        if (!blogData) {
          console.warn("⚠️ data.data not found, trying data");
          blogData = res.data;
        }

        if (!Array.isArray(blogData)) {
          console.error("❌ blogData is not an array:", typeof blogData, blogData);
          blogData = [];
        }

        console.log("Final blogData to set:", blogData);
        console.log("Number of blogs:", blogData.length);

        if (blogData.length > 0) {
          console.log("✅ Successfully loaded", blogData.length, "blogs from admin panel");
          setBlogs(blogData);
        } else {
          console.warn("⚠️ No blogs in admin panel (empty array)");
          setBlogs([]);
        }
      })
      .catch((err) => {
        console.error("❌ ERROR FETCHING BLOGS:", err);
        console.error("Error type:", err.constructor.name);
        console.error("Error message:", err.message);
        console.error("Error request config:", err.config);
        console.error("Error response status:", err.response?.status);
        console.error("Error response statusText:", err.response?.statusText);
        console.error("Error response data:", err.response?.data);
        console.error("Error code:", err.code);
        setBlogs([]);
      });
  }, []);

  // Log whenever blogs state changes
  useEffect(() => {
    console.log("Blogs state updated:", blogs);
    console.log("Number of blogs:", blogs.length);
    console.log("Layers will have:", blogs.length, "items");
  }, [blogs]);

  // Log whenever layers is updated
  useEffect(() => {
    console.log("Layers computed:", layers);
    console.log("Number of layers:", layers.length);
  }, [layers]);
  /* ================= UI ================= */

  // Calculate dynamic height based on number of layers
  const sectionHeight = layers.length === 0 ? "100vh" : `${Math.max(400, layers.length * 200)}vh`;

  return (
    <>
      {/* SEARCH AND FILTER CONTROLS - Fixed below header */}
      <div className="fixed left-0 right-0 z-[1001] flex gap-3 items-center justify-center py-1 w-full bg-[var(--bg-main-gradient)] pointer-events-auto" style={{ top: "50px" }}>
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
                ? "w-[300px] h-10 px-4 justify-start"
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
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* MAIN SECTION - scrollable content area */}
      <section
        ref={sectionRef}
        style={{ height: sectionHeight }}
        className="relative bg-[var(--bg-main-gradient)] font-body"
      >

        <div className="fixed top-0 left-0 right-0 bottom-0 h-screen w-screen overflow-hidden pointer-events-none z-0">

          {/* Debug info - shows if no cards are rendering */}
          {layers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/40">

              <div className="flex flex-col items-center gap-4 text-center">

                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                {/* Main Text */}
                <p className="text-xl font-semibold text-white tracking-wide">

                </p>


              </div>
            </div>
          )}

          {activeCard !== null && (
            <div
              onClick={() => setActiveCard(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md z-[9000] pointer-events-auto"
            />
          )}

          {layers.map((layer, i) => (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCard(i);
              }}
              style={
                activeCard === i
                  ? {
                    transform: `translate(-50%, -50%) scale(${isMobile ? 1.3 : 2})`,
                    zIndex: 9999,
                    filter: "blur(0px)",
                    transition:
                      "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                  }
                  : {}
              }
              className="absolute left-1/2 top-1/2 w-56 h-72 rounded-2xl overflow-hidden bg-[var(--bg-blog_card)] text-white border border-white/10 shadow-xl cursor-pointer will-change-transform pointer-events-auto"
            >

              {activeCard !== i ? (
                <div className="w-full h-full flex flex-col">

                  {/* 🔷 TOP IMAGE (SMALLER) */}
                  <div className="h-[25%] overflow-hidden">
                    <img src={layer.image} className="w-full h-full object-cover" alt={layer.title} />
                  </div>

                  {/* 🔻 TEXT AREA (BIGGER) */}
                  <div className="h-[50%] flex flex-col items-center justify-center bg-[var(--bg-blog_card)] border-y border-white/10 px-3">

                    <p className="font-heading text-base font-bold text-center line-clamp-2 mb-2">
                      {layer.title}
                    </p>

                    <p className="text-xs opacity-70 text-center">
                      {layer.author}
                    </p>

                  </div>

                  {/* 🔷 BOTTOM IMAGE (SMALLER) */}
                  <div className="h-[25%] overflow-hidden">
                    <img
                      src={layer.image}
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleY(-1)" }}
                      alt={layer.title}
                    />
                  </div>

                </div>
              ) : (
                <div className="w-full h-full flex flex-col">

                  <div className="relative h-20">
                    <img src={layer.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute right-2 top-2 text-[10px] font-bold uppercase">
                      {layer.location}
                    </div>
                  </div>

                  <div className="p-3 flex flex-col h-full">

                    {/* CONTENT */}
                    <div className="flex flex-col gap-2">

                      <h2 className="text-sm font-extrabold font-heading leading-tight">
                        {layer.title}
                      </h2>

                      {/* BLOG ID

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] rounded-full">
                      #{i + 1}
                    </span>
                  </div> */}

                      <div className="flex gap-2 text-[10px] opacity-80">
                        {layer.tags.map((t, idx) => (
                          <span key={idx}>{t}</span>
                        ))}
                      </div>

                      <p className="text-[10px] opacity-60">{layer.date}</p>

                      <div>
                        <p className="text-[10px] opacity-50 uppercase">
                          Published by:
                        </p>
                        <p className="text-xs font-semibold">{layer.author}</p>
                      </div>

                      <div className="flex gap-4 mt-2 text-sm opacity-80">
                        <a href={layer.instagram} target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href={layer.github} target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faGithub} />
                        </a>
                        <a href={layer.linkedin} target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                      </div>

                    </div>

                    {/* 🔥 VIEW BUTTON (NEW) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 prevents animation break
                        navigate(`/blogs/${layer.blog_id}`);
                      }}
                      className="mt-auto w-full py-1.5 text-[11px] rounded-full border border-white/20 
             hover:bg-white/10 transition-all duration-300"
                    >
                      View
                    </button>

                  </div>

                </div>

              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Blog;