import { useEffect, useRef, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function Home() {
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const smoothProgress = useRef(0);
  const tickingRef = useRef(false);

  const CARD_DATA = [
    {
      title: "ANIMATE UI",
      location: "Seoul, Korea",
      image: "https://picsum.photos/400/300?7",
      date: "5 MAR, 2024",
      author: "Min",
      tags: ["#animation", "#ui"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "BUILD SYSTEMS",
      location: "Tokyo, Japan",
      image: "https://picsum.photos/400/300?2",
      date: "20 FEB, 2024",
      author: "Priyanshu",
      tags: ["#dev", "#tech"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "EXPLORE DESIGN",
      location: "Paris, France",
      image: "https://picsum.photos/400/300?3",
      date: "25 FEB, 2024",
      author: "Alex",
      tags: ["#design", "#ui"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "SHIP PRODUCTS",
      location: "NYC, USA",
      image: "https://picsum.photos/400/300?4",
      date: "28 FEB, 2024",
      author: "John",
      tags: ["#startup", "#build"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "GROW FAST",
      location: "Berlin, Germany",
      image: "https://picsum.photos/400/300?5",
      date: "1 MAR, 2024",
      author: "Emma",
      tags: ["#growth", "#scale"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "OPTIMIZE CODE",
      location: "Bangalore, India",
      image: "https://picsum.photos/400/300?6",
      date: "3 MAR, 2024",
      author: "Ravi",
      tags: ["#code", "#optimize"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "DEPLOY FAST",
      location: "London, UK",
      image: "https://picsum.photos/400/300?8",
      date: "8 MAR, 2024",
      author: "Harry",
      tags: ["#cloud", "#deploy"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "EVOLVE SYSTEMS",
      location: "Toronto, Canada",
      image: "https://picsum.photos/400/300?9",
      date: "10 MAR, 2024",
      author: "Noah",
      tags: ["#systems", "#scale"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "CREATE IMPACT",
      location: "Sydney, Australia",
      image: "https://picsum.photos/400/300?10",
      date: "12 MAR, 2024",
      author: "Liam",
      tags: ["#impact", "#future"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
    {
      title: "START JOURNEY",
      location: "Morocco, Africa",
      image: "https://picsum.photos/400/300?1",
      date: "18 FEB, 2024",
      author: "Karan Singh",
      tags: ["#travel", "#world"],
      instagram: "#",
      github: "#",
      linkedin: "#",
    },
  ];

  const layers = useMemo(() => {
    return CARD_DATA.map((card, i) => {
      const angle = i * GOLDEN_ANGLE;
      const radius = 20 + Math.random() * 30;

      return {
        id: i,
        ...card,
        rx: Math.cos(angle) * radius,
        ry: Math.sin(angle) * radius,
        baseScale: 0.2,
      };
    });
  }, []);

  const navigate = useNavigate();
  /* ================= OPTIMIZED ANIMATION ================= */

  useEffect(() => {
    const viewportHeight = window.innerHeight;

    const updateCards = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);

      const diff = progress - smoothProgress.current;
      const easing = Math.abs(diff) > 0.2 ? 0.22 : 0.12;
      smoothProgress.current += diff * easing;

      const hasActive = activeCard !== null;

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

        const scale = layer.baseScale + clamped * 1.8;

        let x = layer.rx * clamped;
        let y = layer.ry * clamped;

        if (localProgress > 1) {
          const exit = localProgress - 1;
          x += layer.rx * exit * 3;
          y += layer.ry * exit * 3;
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

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(updateCards);
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
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

  /* ================= UI ================= */

  return (
    <section
      ref={sectionRef}
      className="relative h-[2000vh] bg-[var(--bg-main-gradient)] font-body"
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {activeCard !== null && (
          <div
            onClick={() => setActiveCard(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-md z-[9000]"
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
                  transform: "translate(-50%, -50%) scale(2)",
                  zIndex: 9999,
                  filter: "blur(0px)",
                  transition:
                    "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                }
                : {}
            }
            className="absolute left-1/2 top-1/2 w-56 h-72 rounded-2xl overflow-hidden bg-[var(--bg-muted)] text-white border border-white/10 shadow-xl cursor-pointer will-change-transform"
          >

            {activeCard !== i ? (
              <div className="flex items-center justify-center w-full h-full font-heading text-sm font-bold">
                {layer.title.split(" ")[0]}
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
                      navigate(`/blogs/${i}`); // use index (safe)
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
  );
}

export default Home;