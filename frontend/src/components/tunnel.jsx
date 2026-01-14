import { useEffect, useMemo } from "react";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function Home() {
  const CARD_TEXTS = [
  "Dev",
  "Build",
  "Ship",
  "Scale",
  "Design",
  "Animate",
  "Deploy",
  "Optimize",
  "Grow",
  "Evolve",
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

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById("tunnel-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const progress = Math.min(
        Math.max(-rect.top / rect.height, 0),
        1
      );

      layers.forEach((layer, i) => {
        const card = document.getElementById(`card-${i}`);
        if (!card) return;

        const depth = i / layers.length;
        const windowSize = 0.25;

        const localProgress =
          (progress - depth) / windowSize;

        // -------- CAMERA DEPTH --------
        const scale =
          layer.baseScale +
          Math.min(localProgress, 1) * 1.8;

        // -------- POSITION --------
        let x = layer.rx * Math.min(localProgress, 1);
        let y = layer.ry * Math.min(localProgress, 1);

        // -------- EXIT MOTION (KEY FIX) --------
        if (localProgress > 1) {
          const exit = localProgress - 1;
          x += layer.rx * exit * 3;
          y += layer.ry * exit * 3;
        }

        // -------- BLUR (DISTANCE) --------
        let blur = 0;
        if (localProgress < 0.25) {
          blur = (0.25 - localProgress) * 20;
        }

        // -------- Z-INDEX (STRICT ORDER) --------
        const zIndex =
          (layers.length - i) * 1000 -
          Math.floor(localProgress * 10);

        card.style.transform = `
          translate(-50%, -50%)
          translate(${x}vw, ${y}vh)
          scale(${scale})
        `;
        card.style.filter = `blur(${blur}px)`;
        card.style.opacity = 1;
        card.style.zIndex = zIndex;
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [layers]);

  return (
    <section id="tunnel-section" className="relative h-[500vh] bg-black">
      <div className="sticky top-0 h-screen overflow-visible">
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#7c3aed_0%,_#2563eb_40%,_#0f172a_90%)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-blue-400/20 to-teal-300/20 blur-3xl" />

        {/* CARDS */}
        {layers.map((_, i) => (
          <div
            key={i}
            id={`card-${i}`}
            className="
              absolute left-1/2 top-1/2
              w-56 h-72
              rounded-2xl
              bg-white/10 backdrop-blur-xl
              border border-white/20
              flex items-center justify-center
              text-white text-xl font-semibold
              will-change-transform
            "
          >
           {layers[i].Text}

          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-black/50" />
      </div>
    </section>
  );
}

export default Home;
