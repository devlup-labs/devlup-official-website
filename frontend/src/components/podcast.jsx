import { useEffect, useRef, useState } from "react";
import TopControls from "../components/Video/TopControls";

export default function Podcast() {

  const items = [
  {
    id: 1,
    title: "Stories That Resonate",
    subtitle: "The Art of Storytelling",
    author: "Rahul David",
    date: "17-09-2005",
    img: "https://picsum.photos/900/600?random=1",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    description: "Storytelling shapes how we understand the world.",
    tags: ["#story", "#writing", "#creativity"],
  },
  {
    id: 2,
    title: "Meaningful Conversations",
    subtitle: "Pedro & Claudia",
    author: "Pedro",
    date: "18-09-2005",
    img: "https://picsum.photos/900/600?random=2",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    description: "Deep conversations build real connections.",
    tags: ["#conversation", "#human", "#depth"],
  },
  {
    id: 3,
    title: "Psychology of Greatness",
    subtitle: "With Samira Hadid",
    author: "Samira",
    date: "19-09-2005",
    img: "https://picsum.photos/900/600?random=3",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    description: "Mindset defines success.",
    tags: ["#mindset", "#growth", "#psychology"],
  },

  // 👇 ADD MORE LIKE THIS

  {
    id: 4,
    title: "Future of AI",
    subtitle: "Tech & Humanity",
    author: "Aarav Mehta",
    date: "20-09-2005",
    img: "https://picsum.photos/900/600?random=4",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    description: "AI is reshaping the world faster than ever.",
    tags: ["#ai", "#future", "#tech"],
  },
  {
    id: 5,
    title: "Startup Mindset",
    subtitle: "Building from Zero",
    author: "Neha Kapoor",
    date: "21-09-2005",
    img: "https://picsum.photos/900/600?random=5",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    description: "Startups thrive on chaos and persistence.",
    tags: ["#startup", "#business", "#grind"],
  },
  {
    id: 6,
    title: "Creative Flow",
    subtitle: "Unlocking Potential",
    author: "Kabir Singh",
    date: "22-09-2005",
    img: "https://picsum.photos/900/600?random=6",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    description: "Creativity is a muscle you train.",
    tags: ["#creativity", "#flow", "#design"],
  },
  {
    id: 7,
    title: "Deep Work",
    subtitle: "Focus Like Never Before",
    author: "Ishita Verma",
    date: "23-09-2005",
    img: "https://picsum.photos/900/600?random=7",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    description: "Distraction is the enemy of greatness.",
    tags: ["#focus", "#productivity", "#work"],
  },
  {
    id: 8,
    title: "Life Philosophy",
    subtitle: "Thinking Clearly",
    author: "Rohan Das",
    date: "24-09-2005",
    img: "https://picsum.photos/900/600?random=8",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    description: "Clear thinking leads to better living.",
    tags: ["#life", "#philosophy", "#clarity"],
  },
];

  const containerRef = useRef(null);
  const audioRef = useRef(null);

  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const raf = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const speeds = [1, 1.25, 1.5, 2];

  const friction = 0.92;
  const wheelStrength = 0.0022;
  const snapStrength = 0.12;

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
  }, []);

  /* ================= AUDIO ================= */

  const active = items[activeIndex];

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = active.audio;
    audioRef.current.playbackRate = speed;
    setProgress(0);
    if (isPlaying) audioRef.current.play();
  }, [activeIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);

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
    if (!audioRef.current) return;
    let newTime = audioRef.current.currentTime + sec;
    newTime = Math.max(0, Math.min(duration, newTime));
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
    <div className="bg-[url('/bgweb3.jpeg')] text-black">

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
                  <img src={item.img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[460px]">
            <div className="flex flex-col gap-6 h-full">

              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">{active.date}</span>
                <span className="text-sm opacity-60">{active.author}</span>
              </div>

              <h1 className="text-3xl font-bold uppercase">
                {active.title}: {active.subtitle}
              </h1>

              <p className="text-sm opacity-60">{active.description}</p>

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
                          {/* arrow */}
                          <path d="M10 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />

                          {/* door/rectangle */}
                          <rect x="13" y="5" width="6" height="14" rx="2" />
                        </svg>
                      </button>
                      {/* BACK */}
                      <button onClick={() => skipTime(-5)}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <polygon points="11,19 2,12 11,5" />
                          <polygon points="22,19 13,12 22,5" />
                        </svg>
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
                      <button onClick={() => skipTime(5)}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <polygon points="13,5 22,12 13,19" />
                          <polygon points="2,5 11,12 2,19" />
                        </svg>
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
    </div>
  );
}