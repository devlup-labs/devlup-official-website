import { useEffect, useRef, useState } from "react";
import TopControls from "../components/Video/TopControls";
import { getPodcasts } from "../api/services.js";

export default function Podcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});

  // Declare all states first
  const [activeIndex, setActiveIndex] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Declare all refs
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const raf = useRef(null);

  const speeds = [1, 1.25, 1.5, 2];
  const friction = 0.92;
  const wheelStrength = 0.0022;
  const snapStrength = 0.12;

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

  // Convert podcasts from admin panel to items format for carousel
  const items = podcasts.map((podcast) => ({
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

  console.log("📊 Items array:", items);
  console.log("📊 Items length:", items.length);
  console.log("📊 Active index:", activeIndex);
  console.log("📊 Clicked index:", clickedIndex);
  console.log("📊 Active podcast:", items[activeIndex]);
  console.log("📊 Audio URLs:", items.map(i => ({ title: i.title, audio: i.audio })));

  /* ================= SCROLL ================= */

  const updateTransforms = () => {
    const cards = containerRef.current?.children;
    if (!cards) return;

    for (let i = 0; i < cards.length; i++) {
      const offset = i - scrollPos.current;
      const distance = Math.abs(offset);
      const translateY = offset * 170;
      const baseScale = 1 - Math.min(distance * 0.1, 0.5);

      let clickScale = 1;
      if (clickedIndex === i) clickScale = 1.12;
      else if (clickedIndex !== null) clickScale = 0.94;

      const finalScale = baseScale * clickScale;

      const el = cards[i];

      el.style.transform = `translateY(${translateY}px) scale(${finalScale})`;
      el.style.opacity =
        distance > 6
          ? 0
          : clickedIndex !== null && clickedIndex !== i
            ? 0.6
            : 1;

      el.style.filter =
        clickedIndex !== null && clickedIndex !== i
          ? "blur(4px)"
          : "none";

      el.style.zIndex =
        clickedIndex === i
          ? 5000
          : Math.round(1000 - distance * 50);
    }
  };

  const animate = () => {
    velocity.current *= friction;
    scrollPos.current += velocity.current;

    scrollPos.current = Math.max(0, Math.min(items.length - 1, scrollPos.current));

    if (Math.abs(velocity.current) < 0.002) {
      const nearest = Math.round(scrollPos.current);
      scrollPos.current += (nearest - scrollPos.current) * snapStrength;
    }

    const newIndex = Math.round(scrollPos.current);
    setActiveIndex(newIndex);

    updateTransforms();

    if (
      Math.abs(velocity.current) > 0.0005 ||
      Math.abs(scrollPos.current - newIndex) > 0.0005
    ) {
      raf.current = requestAnimationFrame(animate);
    } else {
      raf.current = null;
    }
  };

  useEffect(() => {
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
  }, [items.length]);

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

  const toggleSpeed = () => {
    const i = speeds.indexOf(speed);
    setSpeed(speeds[(i + 1) % speeds.length]);
  };

  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="text-[var(--text-primary)]">
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-white">Loading Podcasts...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-screen flex items-center justify-center">
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

          <div className="fixed top-1 left-0 w-full flex justify-center z-[3000] pointer-events-none">
            <div className="pointer-events-auto">
              <TopControls />
            </div>
          </div>

          <div className="h-screen flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">

              {/* LEFT STACK */}
              <div className="absolute left-[10%] top-1/2 -translate-y-1/2">
                <div ref={containerRef} className="relative h-[650px] w-[520px] flex items-center justify-center">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (clickedIndex === index) {
                          setClickedIndex(null);
                          setIsPlaying(false);
                        } else {
                          setClickedIndex(index);
                          setActiveIndex(index);
                          setIsPlaying(true);
                        }
                      }}
                      className="absolute w-[520px] h-[320px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                    >
                      {!imageLoaded[item.id] && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      <img
                        src={item.img}
                        className="w-full h-full object-cover"
                        onLoad={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                        onError={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[460px]">
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
                          <button onClick={toggleSpeed}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                            {speed}x
                          </button>

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
        </>
      )}
    </div>
  );
}