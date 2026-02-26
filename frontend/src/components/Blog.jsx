import { useEffect, useRef, useMemo, useState } from "react";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function Home() {
  const [activeCard, setActiveCard] = useState(null);
const sectionRef = useRef(null);
const cardRefs = useRef([]);
const smoothProgress = useRef(0);
  const CARD_TEXTS = [
    "Dev","Build","Ship","Scale","Design",
    "Animate","Deploy","Optimize","Grow","Evolve",
  ];

  const layers = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const angle = i * GOLDEN_ANGLE;
      const radius = 20 + Math.random() * 30;

      return {
        id: i,
        Text: CARD_TEXTS[i],
        rx: Math.cos(angle) * radius,
        ry: Math.sin(angle) * radius,
        baseScale: 0.2,
      };
    });
  }, []);

  /* ================= SMOOTH SCROLL ANIMATION ================= */

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateCards);
        ticking = true;
      }
    };

    const updateCards = () => {
     const section = sectionRef.current;
if (!section) return;

      const rect = section.getBoundingClientRect();
if (rect.bottom < 0 || rect.top > window.innerHeight)
  return;
      const progress = Math.min(
        Math.max(-rect.top / rect.height, 0),
        1
      );
     const diff = progress - smoothProgress.current;

smoothProgress.current += diff * (
  Math.abs(diff) > 0.2 ? 0.35 : 0.18
);
if (progress < 0.001)
  smoothProgress.current = 0;

     layers.forEach((layer, i) => {

  const card = cardRefs.current[i];
  if (!card) return;

  // ✅ hide other cards when one is opened
  if (activeCard !== null) {
    if (i === activeCard) {
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";
    } else {
      card.style.opacity = "0";
      card.style.pointerEvents = "none";
    }
    return;
  }

  // restore cards when closed
  card.style.opacity = "1";
        if (activeCard === i) return;

        

        const depth = i / layers.length;
        const windowSize = 0.18;
        const localProgress =
  (smoothProgress.current - depth) / windowSize;
        const clamped = Math.min(localProgress, 1);

        const scale =
          layer.baseScale + clamped * 1.8;

        let x = layer.rx * clamped;
        let y = layer.ry * clamped;

        if (localProgress > 1) {
          const exit = localProgress - 1;
          x += layer.rx * exit * 3;
          y += layer.ry * exit * 3;
        }

        /* -------- BLUR -------- */
       let blur = 0;

if (localProgress < 0.25) {
  blur = Math.round((0.25 - localProgress) * 6);
}

        /* -------- CLICK ENABLE THRESHOLD -------- */
        const clickable = blur < 1.5;

        const zIndex =
          (layers.length - i) * 1000 -
          Math.floor(localProgress * 10);

     const transformValue =
`translate(-50%, -50%)
 translate3d(${x}vw, ${y}vh, 0)
 scale(${scale})`;

if (card.dataset.t !== transformValue) {
  card.style.transform = transformValue;
  card.dataset.t = transformValue;
}

const prevBlur = card.dataset.blur;

if (prevBlur != blur) {
  card.style.filter = `blur(${blur}px)`;
  card.dataset.blur = blur;
}
card.style.zIndex = zIndex;
card.style.pointerEvents =
  clickable ? "auto" : "none";

        // disable clicking when far

      });

      ticking = false;
    };

    window.addEventListener("scroll", onScroll,{
      passive: true,
    });
    requestAnimationFrame(updateCards);

    return () => window.removeEventListener("scroll", onScroll);
  }, [layers, activeCard]);

  /* ================= ESC CLOSE ================= */

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActiveCard(null);
    };

    window.addEventListener("keydown", handleEsc);
    return () =>
      window.removeEventListener("keydown", handleEsc);
  }, []);

  /* ================= JSX ================= */

  return (
    <section
      id="tunnel-section"
       ref={sectionRef}
      className="relative h-[2000vh] bg-[var(--bg-main)] text-[var(--text-primary)]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        <div className="absolute inset-0 bg-[var(--bg-main)]" />

        {activeCard !== null && (
          <div
            onClick={() => setActiveCard(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[9000]"
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
                    transform:
                      "translate(-50%, -50%) scale(2)",
                    zIndex: 9999,
                    filter: "blur(0px)",
                  }
                : {}
            }
          className="
absolute left-1/2 top-1/2
w-56 h-72
rounded-2xl
bg-[var(--bg-surface)]
backdrop-blur-sm
border border-[var(--border-subtle)]
flex items-center justify-center
text-[var(--text-primary)]
text-xl font-semibold
cursor-pointer
will-change-transform
"
          >
            {layer.Text}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;
