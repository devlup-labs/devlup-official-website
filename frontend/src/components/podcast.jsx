import { useEffect, useRef, useState } from "react";
import TopControls from "../components/Video/TopControls";
import { getPodcasts } from "../api/services.js";

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  // Declare all states first
  const [activeIndex, setActiveIndex] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Declare all refs
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const raf = useRef(null);
  const targetIndex = useRef(null);
  const clickedIndexRef = useRef(null); // Fix stale closure in animation frame

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const friction = 0.92;
  const wheelStrength = 0.0022;
  const snapStrength = 0.12;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("🚀 Starting to fetch podcasts from admin panel...");
    setLoading(true);

    getPodcasts()
      .then((res) => {
        console.log("📨 Full response object:", res);
        console.log("Response data:", res.data);

        // Get podcast data from API - try multiple paths
        let podcastData = res.data?.data;

        if (!podcastData) {
          console.warn("⚠️ data.data not found, trying data");
          podcastData = res.data;
        }

        if (!Array.isArray(podcastData)) {
          console.error("❌ podcastData is not an array:", typeof podcastData, podcastData);
          podcastData = [];
        }

        console.log("Final podcastData to set:", podcastData);
        console.log("Number of podcasts:", podcastData.length);

        if (podcastData.length > 0) {
          console.log("✅ Successfully loaded", podcastData.length, "podcasts from admin panel");
          setPodcasts(podcastData);
        } else {
          console.warn("⚠️ No podcasts in admin panel (empty array)");
          setPodcasts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ ERROR FETCHING PODCASTS:", err);
        console.error("Error response data:", err.response?.data);
        setPodcasts([]);
        setLoading(false);
      });
  }, []);

  // Convert and filter podcasts from admin panel
  const allItems = podcasts.map((podcast) => ({
    id: podcast.podcast_id,
    title: podcast.podcast_title,
    subtitle: podcast.podcast_subtitle || "",
    author: podcast.podcast_author || "Unknown",
    date: podcast.podcast_date || "N/A",
    img: podcast.podcast_thumbnail || "https://picsum.photos/900/600?random=default",
    audio: podcast.podcast_url || "",
    description: podcast.podcast_description || "No description available.",
    tags: Array.isArray(podcast.podcast_tags) ? podcast.podcast_tags : [],
  }));

  // Filter items by search term and selected tag
  const items = allItems.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const authorMatch = item.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatch = titleMatch || authorMatch;

    const tagMatch = selectedTags.length === 0 || item.tags.some(tag => selectedTags.includes(tag));

    return searchMatch && tagMatch;
  });

  // Extract all unique tags from podcasts
  const allTags = [];
  podcasts.forEach((podcast) => {
    const tags = Array.isArray(podcast.podcast_tags) ? podcast.podcast_tags : [];
    tags.forEach(tag => {
      if (!allTags.includes(tag)) {
        allTags.push(tag);
      }
    });
  });

  // console.log("📊 Items array:", items);
  // console.log("📊 Items length:", items.length);
  // console.log("📊 Active index:", activeIndex);
  // console.log("📊 Clicked index:", clickedIndex);
  // console.log("📊 Active podcast:", items[activeIndex]);
  // console.log("📊 Audio URLs:", items.map(i => ({ title: i.title, audio: i.audio })));

  // Ensure tracking updates in refs immediately
  useEffect(() => {
    if (items.length === 0) {
      setActiveIndex(0);
      setClickedIndex(null);
      setIsPlaying(false);
      scrollPos.current = 0;
      return;
    }

    if (activeIndex > items.length - 1) {
      const nextIndex = items.length - 1;
      setActiveIndex(nextIndex);
      scrollPos.current = nextIndex;
      if (clickedIndex !== null && clickedIndex > items.length - 1) {
        setClickedIndex(null);
        setIsPlaying(false);
      }
    }
  }, [items.length, activeIndex, clickedIndex]);

  useEffect(() => {
    clickedIndexRef.current = clickedIndex;
    if (isMobile) return;
    if (!raf.current) {
      raf.current = requestAnimationFrame(animate);
    }
  }, [clickedIndex, isMobile]);

  /* ================= SCROLL ================= */

  const updateTransforms = () => {
    const cards = containerRef.current?.children;
    if (!cards) return;

    // Always use latest from ref inside raf loop
    const currentIndex = clickedIndexRef.current;

    for (let i = 0; i < cards.length; i++) {
      const offset = i - scrollPos.current;
      const distance = Math.abs(offset);
      const translateY = offset * 170;

      // Enlarge the focused card smoothly and scale down the background cards
      const baseScale = 1.05 - Math.min(distance * 0.1, 0.5);

      let clickScale = 1;
      if (currentIndex === i) clickScale = 1.05; // Change this value to adjust the zoom (e.g., 1.05 is 5% zoom, 1.12 was 12%)
      else if (currentIndex !== null) clickScale = 0.96; // Adjusts how much the other cards shrink

      const finalScale = baseScale * clickScale;

      const el = cards[i];

      el.style.transform = `translateY(${translateY}px) scale(${finalScale})`;
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease, filter 0.4s ease';

      // Background cards get darker/faded
      el.style.opacity =
        distance > 6
          ? 0
          : currentIndex !== null
            ? (currentIndex === i ? 1 : 0.4)
            : 1;

      const brightness = currentIndex !== null && currentIndex !== i ? 0.4 : 1;

      el.style.filter =
        currentIndex !== null && currentIndex !== i
          ? "blur(4px) brightness(0.4)"
          : `brightness(${brightness})`;

      el.style.zIndex =
        currentIndex === i
          ? 5000
          : Math.round(1000 - distance * 50);
    }
  };

  const animate = () => {
    let diff = 0;
    if (targetIndex.current !== null) {
      // Smoothly animate towards the clicked card
      diff = targetIndex.current - scrollPos.current;
      scrollPos.current += diff * 0.08;

      if (Math.abs(diff) < 0.005) {
        scrollPos.current = targetIndex.current;
        targetIndex.current = null;
      }
    } else {
      velocity.current *= friction;
      scrollPos.current += velocity.current;

      scrollPos.current = Math.max(0, Math.min(items.length - 1, scrollPos.current));

      if (Math.abs(velocity.current) < 0.002) {
        const nearest = Math.round(scrollPos.current);
        scrollPos.current += (nearest - scrollPos.current) * snapStrength;
      }
    }

    const newIndex = Math.round(scrollPos.current);
    setActiveIndex(newIndex);

    updateTransforms();

    if (
      targetIndex.current !== null ||
      Math.abs(velocity.current) > 0.0005 ||
      Math.abs(scrollPos.current - newIndex) > 0.0005
    ) {
      raf.current = requestAnimationFrame(animate);
    } else {
      raf.current = null;
    }
  };

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    let hovering = false;

    const enter = () => (hovering = true);
    const leave = () => (hovering = false);

    container.addEventListener("mouseenter", enter);
    container.addEventListener("mouseleave", leave);

    const onWheel = (e) => {
      if (!hovering) return;
      e.preventDefault();

      // Break focus/animations when manually scrolling
      if (targetIndex.current !== null || clickedIndexRef.current !== null) {
        targetIndex.current = null;
        setClickedIndex(null);
        clickedIndexRef.current = null;
        setIsPlaying(false);
      }

      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);
      velocity.current += delta * wheelStrength;
      velocity.current = Math.max(-0.12, Math.min(0.12, velocity.current));

      if (!raf.current) raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    raf.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mouseenter", enter);
      container.removeEventListener("mouseleave", leave);
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf.current);
    };
  }, [items.length, isMobile]);

  /* ================= AUDIO ================= */

  const active = items[activeIndex] || {};

  // Only change audio source when switching podcasts
  useEffect(() => {
    if (!audioRef.current) return;
    console.log("🎵 Setting audio source:", active.audio, "for podcast:", active.title);
    audioRef.current.src = active.audio || "";
    setProgress(0);
  }, [activeIndex, active.audio]);

  // Handle play/pause without resetting audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && active.audio) {
      audioRef.current.play().catch(err => console.error("Play error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, active.audio]);

  // Handle speed change without resetting audio
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (clickedIndex === null && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
  }, [clickedIndex]);

  const handleTimeUpdate = () => setProgress(audioRef.current.currentTime);
  const handleLoaded = () => setDuration(audioRef.current.duration);

  const handleSeek = (e) => {
    const t = Number(e.target.value);
    audioRef.current.currentTime = t;
    setProgress(t);
  };

  const skipTime = (sec) => {
    console.log("⏩ Skip time called with:", sec, "seconds");
    if (!audioRef.current) {
      console.error("❌ Audio ref not available");
      return;
    }
    if (!active.audio) {
      console.error("❌ No audio URL loaded - add podcast_url in admin panel");
      return;
    }
    let newTime = audioRef.current.currentTime + sec;
    newTime = Math.max(0, Math.min(duration, newTime));
    console.log("✅ Setting time to:", newTime, "from:", audioRef.current.currentTime);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  // const toggleSpeed = () => {
  //   const i = speeds.indexOf(speed);
  //   setSpeed(speeds[(i + 1) % speeds.length]);
  // };

  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="text-white">
      {/* FIXED CONTROLS - Aligned with Header */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-[3000] pointer-events-none" style={{ height: "88px" }}>
        <div className="pointer-events-auto flex items-center justify-center">
          <TopControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            tags={allTags}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-white">Loading Podcasts...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-4">No Podcasts Found</p>
            <p className="text-gray-300">Please add podcasts from the admin panel.</p>
          </div>
        </div>
      ) : (
        <>
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoaded}
          />

          {isMobile ? (
            <div className="min-h-screen pt-24 pb-8 px-4">
              <div className="mx-auto w-full max-w-md flex flex-col gap-1">

                {active && (
                  <>
                    <div className="rounded-2xl overflow-hidden shadow-xl bg-black/20 border border-white/10">
                      {!imageLoaded[active.id] && (
                        <div className="flex h-[220px] w-full items-center justify-center bg-gray-700">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                        </div>
                      )}
                      <img
                        src={active.img}
                        className="h-[220px] w-full object-cover"
                        onLoad={() => setImageLoaded(prev => ({ ...prev, [active.id]: true }))}
                        onError={() => setImageLoaded(prev => ({ ...prev, [active.id]: true }))}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs opacity-70 px-1">
                      <span>{active.date}</span>
                      <span>{active.author}</span>
                    </div>

                    <h1 className="text-xl font-bold uppercase leading-tight">
                      {active.title}: {active.subtitle}
                    </h1>

                    <p className="text-sm opacity-70 leading-relaxed">{active.description}</p>
                  </>
                )}

                <div className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          setClickedIndex(null);
                          setIsPlaying(false);
                          setShowSpeedMenu(false);
                        }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-md"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white" fill="none" strokeWidth="2.5">
                          <path d="M14 3h5v18h-5" strokeLinecap="round" />
                          <path d="M10 12H3" strokeLinecap="round" />
                          <path d="M6 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 6v3" strokeLinecap="round" />
                          <path d="M10 15v3" strokeLinecap="round" />
                        </svg>
                      </button>

                      <button
                        onClick={() => skipTime(-5)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-md text-white text-xs font-semibold"
                      >
                        -5s
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                      >
                        {isPlaying ? (
                          <div className="flex gap-[5px]">
                            <div className="w-[5px] h-6 bg-white rounded-sm" />
                            <div className="w-[5px] h-6 bg-white rounded-sm" />
                          </div>
                        ) : (
                          <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[10px] border-y-transparent ml-[4px]" />
                        )}
                      </button>

                      <button
                        onClick={() => skipTime(5)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-md text-white text-xs font-semibold"
                      >
                        +5s
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu((prev) => !prev)}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm"
                        >
                          {speed}x
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute right-0 top-full mt-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl py-2 px-2 flex flex-col gap-1 text-sm text-white z-50 shadow-xl">
                            {speeds.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  setSpeed(s);
                                  setShowSpeedMenu(false);
                                }}
                                className={`px-3 py-1 rounded-md transition ${speed === s ? "bg-white/20" : "hover:bg-white/10"}`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full flex items-center gap-3">
                      <span className="text-xs w-10 text-right">{formatTime(progress)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="w-full accent-blue-500"
                      />
                      <span className="text-xs w-10">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto pb-2">
                  <div className="flex gap-3 min-w-max">
                    {items.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSpeedMenu(false);
                          if (activeIndex === index) {
                            if (clickedIndex === index) {
                              setClickedIndex(null);
                              clickedIndexRef.current = null;
                              setIsPlaying(false);
                            } else {
                              setClickedIndex(index);
                              clickedIndexRef.current = index;
                              setIsPlaying(true);
                            }
                          } else {
                            setActiveIndex(index);
                            scrollPos.current = index;
                            velocity.current = 0;
                            setClickedIndex(null);
                            clickedIndexRef.current = null;
                            setIsPlaying(false);
                          }
                        }}
                        className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border transition ${activeIndex === index ? "border-blue-400 ring-2 ring-blue-400/30" : "border-white/10"}`}
                      >
                        <img src={item.img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-screen flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">

                {/* LEFT STACK */}
                <div className="absolute left-[10%] top-1/2 -translate-y-1/2">
                  <div ref={containerRef} className="relative h-[650px] w-[520px] flex items-center justify-center">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (activeIndex === index) {
                            if (clickedIndex === index) {
                              setClickedIndex(null);
                              clickedIndexRef.current = null;
                              setIsPlaying(false);
                              targetIndex.current = null;
                            } else {
                              setClickedIndex(index);
                              clickedIndexRef.current = index;
                              setIsPlaying(true);
                            }
                          } else {
                            targetIndex.current = index;
                            velocity.current = 0;
                            setClickedIndex(null);
                            clickedIndexRef.current = null;
                            setIsPlaying(false);

                            // Ensure raf triggers
                            if (raf.current) cancelAnimationFrame(raf.current);
                            raf.current = requestAnimationFrame(animate);
                          }
                        }}
                        className="absolute w-[520px] h-[320px] rounded-2xl shadow-xl cursor-pointer"
                      >
                        <div className="w-full h-full rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105">
                          {!imageLoaded[item.id] && (
                            <div className="flex h-full w-full items-center justify-center bg-gray-700">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                            </div>
                          )}
                          <img
                            src={item.img}
                            className="h-full w-full object-cover"
                            onLoad={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                            onError={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="absolute right-[2%] lg:right-[5%] xl:right-[10%] top-1/2 -translate-y-1/2 w-[460px]">
                  <div className="flex flex-col gap-6 h-full">

                    {active && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-60">{active.date}</span>
                          <span className="text-sm opacity-60">{active.author}</span>
                        </div>

                        <h1 className="text-3xl font-bold uppercase">
                          {active.title}: {active.subtitle}
                        </h1>

                        <p className="text-sm opacity-60">{active.description}</p>
                      </>
                    )}

                    {/* PLAYER */}
                    <div className="flex-1 flex items-end justify-center">

                      {clickedIndex === null ? (
                        <button
                          onClick={() => {
                            setClickedIndex(activeIndex);
                            setIsPlaying(true);
                          }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl"
                        >
                          <div className="w-0 h-0 border-l-[22px] border-l-white border-y-[12px] border-y-transparent ml-[6px]" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-6">

                          <div className="flex items-center gap-8">

                            {/* EXIT */}
                            <button
                              onClick={() => {
                                setClickedIndex(null);
                                setIsPlaying(false);
                              }}
                              className="w-14 h-14 rounded-2xl flex items-center justify-center
                             bg-gradient-to-br from-blue-400 to-blue-600
                             shadow-md hover:scale-110 active:scale-95 transition"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-6 h-6 stroke-white"
                                fill="none"
                                strokeWidth="2.5"
                              >
                                {/* door */}
                                <path d="M14 3h5v18h-5" strokeLinecap="round" />

                                {/* arrow entering door */}
                                <path d="M10 12H3" strokeLinecap="round" />
                                <path d="M6 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />

                                {/* bracket feel (like your image) */}
                                <path d="M10 6v3" strokeLinecap="round" />
                                <path d="M10 15v3" strokeLinecap="round" />
                              </svg>
                            </button>
                            {/* BACK */}
                            <button
                              onClick={() => skipTime(-5)}
                              className="w-14 h-14 rounded-2xl flex items-center justify-center
                           bg-gradient-to-br from-blue-400 to-blue-600 shadow-md
                           text-white font-semibold text-sm hover:scale-110 active:scale-95 transition"
                            >
                              -5s
                            </button>

                            {/* PLAY */}
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-24 h-24 rounded-full flex items-center justify-center
                       bg-gradient-to-br from-blue-400 to-blue-600
                       shadow-[0_12px_40px_rgba(0,0,0,0.35)]
                      hover:scale-110 transition"
                            >
                              {isPlaying ? (
                                <div className="flex gap-[6px]">
                                  <div className="w-[6px] h-7 bg-white rounded-sm" />
                                  <div className="w-[6px] h-7 bg-white rounded-sm" />
                                </div>
                              ) : (
                                <div className="w-0 h-0 border-l-[22px] border-l-white border-y-[12px] border-y-transparent ml-[6px]" />
                              )}
                            </button>
                            {/* FORWARD */}
                            <button
                              onClick={() => skipTime(5)}
                              className="w-14 h-14 rounded-2xl flex items-center justify-center
                           bg-gradient-to-br from-blue-400 to-blue-600 shadow-md
                           text-white font-semibold text-sm hover:scale-110 active:scale-95 transition"
                            >
                              +5s
                            </button>


                            {/* SPEED */}
                            <div className="relative">

                              {/* BUTTON */}
                              <button
                                onClick={() => setShowSpeedMenu((prev) => !prev)}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                              >
                                {speed}x
                              </button>

                              {/* DROPDOWN */}
                              {showSpeedMenu && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
                              bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-md rounded-xl 
                              py-2 px-3 flex flex-col gap-1 text-sm text-white z-50 shadow-xl">

                                  {speeds.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => {
                                        setSpeed(s);
                                        setShowSpeedMenu(false);
                                      }}
                                      className={`px-3 py-1 rounded-md transition 
            ${speed === s ? "bg-white/20" : "hover:bg-white/10"}`}
                                    >
                                      {s}x
                                    </button>
                                  ))}

                                </div>
                              )}

                            </div>

                          </div>

                          {/* PROGRESS */}
                          <div className="w-full flex items-center gap-3">
                            <span className="text-xs w-10 text-right">{formatTime(progress)}</span>

                            <input
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={progress}
                              onChange={handleSeek}
                              className="w-full accent-blue-500"
                            />

                            <span className="text-xs w-10">{formatTime(duration)}</span>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}