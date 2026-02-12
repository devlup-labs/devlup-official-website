import { useEffect, useMemo, useState } from "react";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function Home() {
  const [activeCard, setActiveCard] = useState(null);

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
      const section = document.getElementById("tunnel-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();

      const progress = Math.min(
        Math.max(-rect.top / rect.height, 0),
        1
      );

      layers.forEach((layer, i) => {
        if (activeCard === i) return;

        const card = document.getElementById(`card-${i}`);
        if (!card) return;

        const depth = i / layers.length;
        const windowSize = 0.25;
        const localProgress = (progress - depth) / windowSize;

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
          blur = (0.25 - localProgress) * 20;
        }

        /* -------- CLICK ENABLE THRESHOLD -------- */
        const clickable = blur < 1.5;

        const zIndex =
          (layers.length - i) * 1000 -
          Math.floor(localProgress * 10);

        card.style.transform = `
          translate(-50%, -50%)
          translate(${x}vw, ${y}vh)
          scale(${scale})
        `;

        card.style.filter = `blur(${blur}px)`;
        card.style.zIndex = zIndex;

        // disable clicking when far
        card.style.pointerEvents = clickable
          ? "auto"
          : "none";
      });

      ticking = false;
    };

    window.addEventListener("scroll", onScroll);
    updateCards();

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
      className="relative h-[3000vh] bg-[var(--bg-main)] text-[var(--text-primary)]"
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
            id={`card-${i}`}
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
              backdrop-blur-xl
              border border-[var(--border-subtle)]
              flex items-center justify-center
              text-[var(--text-primary)]
              text-xl font-semibold
              cursor-pointer
              transition-transform duration-300
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
