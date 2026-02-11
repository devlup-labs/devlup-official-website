import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SLOT_HEIGHT = 90;
const EXPAND_HEIGHT = 110;

// 🌟 Glow presets
const GLOW_ON = "0 0 30px rgba(34,211,238,0.6)";
const GLOW_PULSE = "0 0 45px rgba(34,211,238,0.9)";
const GLOW_OFF = "0 0 0 rgba(0,0,0,0)";

export default function LaserPushReveal() {
  const cardsRef = useRef([]);
  const scanRef = useRef(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const scan = { y: 0 };

    if (reveal) {
     

      gsap.to(scan, {
        y: 100,
        duration: 6,
        ease: "power2.inOut",

        onUpdate: () => {
          const y = scan.y;

          gsap.set(scanRef.current, { top: `${y}%`, opacity: 1 });
          document.documentElement.style.setProperty("--scan-y", `${y}%`);

          cardsRef.current.forEach((card) => {
            if (!card || card.dataset.done) return;

            const slot = card.querySelector(".reveal-slot");
             const slotRect = slot.getBoundingClientRect();

            const triggerPoint =
              (slotRect.top / window.innerHeight) * 100;
            if (y >= triggerPoint) {
              card.dataset.done = "true";

              const oldC = card.querySelector(".old-content");
              const newC = card.querySelector(".new-content");
              const wrapper = card.querySelector(".content-wrapper");

              // ⚡ Pulse glow exactly at hit
              gsap.fromTo(
                card,
                { boxShadow: GLOW_OFF },
                {
                  boxShadow: GLOW_PULSE,
                  duration: 0.4,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.out",
                }
              );

              // ⬇️ Expand card internally
              gsap.to(wrapper, {
                height: `+=${EXPAND_HEIGHT}`,
                duration: 0.6,
                ease: "power2.out",
              });

              // ⬇️ Push old content down
              gsap.to(oldC, {
                marginTop: EXPAND_HEIGHT,
                duration: 0.6,
                ease: "power3.out",
              });

              // ✨ Reveal new content
              gsap.fromTo(
                newC,
                { opacity: 0, y: -20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  delay: 0.15,
                  ease: "power3.out",
                }
              );
            }
          });
        },

        // 🧊 Remove glow after scan finishes
        onComplete: () => {
          gsap.to(cardsRef.current, {
            boxShadow: GLOW_OFF,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      });
    } else {
      // 🔁 RESET
      gsap.set(scanRef.current, { opacity: 0, top: "0%" });

      cardsRef.current.forEach((card) => {
        if (!card) return;
        card.dataset.done = "";

        const oldC = card.querySelector(".old-content");
        const newC = card.querySelector(".new-content");
        const wrapper = card.querySelector(".content-wrapper");

        gsap.set(oldC, { marginTop: 0 });
        gsap.set(newC, { opacity: 0, y: -20 });
        gsap.set(wrapper, { height: "auto" });
        gsap.set(card, { boxShadow: GLOW_OFF });
      });
    }
  }, [reveal]);

  return (
    <div className="relative min-h-screen bg-[#0b0f14] text-white p-10 overflow-hidden">
      {/* 🔵 LASER */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 h-[4px] z-50 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, #22d3ee, white, #22d3ee, transparent)",
          boxShadow:
            "0 0 20px #22d3ee, 0 0 60px rgba(34,211,238,0.7)",
          opacity: 0,
        }}
      />

      {/* SHADOW */}
      <div
        className="absolute left-0 right-0 h-[36px] z-40 pointer-events-none"
        style={{
          top: "calc(var(--scan-y) - 18px)",
          background:
            "linear-gradient(to top, rgba(0,0,0,.75), transparent)",
          filter: "blur(6px)",
        }}
      />

      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {/* PROFILE */}
        <div
          ref={(el) => (cardsRef.current[0] = el)}
          className="bg-[#121821] rounded-3xl p-8 overflow-hidden"
        >
          <div className="content-wrapper">
            <div className="relative reveal-slot" style={{ height: SLOT_HEIGHT }}>
              <div className="new-content opacity-0">
                <h3 className="text-cyan-400 text-lg">Identity Verified</h3>
                <p className="text-gray-300">Access Level: Alpha</p>
              </div>
            </div>

            <div className="old-content">
              <img
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12"
                className="w-32 h-32 rounded-full mx-auto mt-6"
              />
              <h2 className="mt-4 text-xl">Joy Sharma</h2>
              <p className="text-gray-400">Frontend Developer</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            className="bg-[#121821] rounded-3xl p-4 overflow-hidden"
          >
            <div className="content-wrapper">
              <div className="relative reveal-slot" style={{ height: SLOT_HEIGHT }}>
                <div className="new-content opacity-0 flex gap-3">
                  <span className="px-4 py-2 rounded-full border border-cyan-400 text-cyan-300">
                    Secured
                  </span>
                  <span className="px-4 py-2 rounded-full border border-cyan-400 text-cyan-300">
                    Encrypted
                  </span>
                </div>
              </div>

              <div className="old-content flex gap-3 mt-2">
                <button className="px-4 py-2 bg-white text-black rounded-full">
                  Overview
                </button>
                <button className="px-4 py-2 bg-white text-black rounded-full">
                  Education
                </button>
              </div>
            </div>
          </div>

          <div
            ref={(el) => (cardsRef.current[2] = el)}
            className="bg-[#121821] rounded-3xl p-10 overflow-hidden"
          >
            <div className="content-wrapper">
              <div className="relative reveal-slot" style={{ height: SLOT_HEIGHT }}>
                <div className="new-content opacity-0">
                  <h1 className="text-cyan-400 text-3xl">Project HELIOS</h1>
                  <p className="text-gray-300">
                    Classified Interface System
                  </p>
                </div>
              </div>

              <div className="old-content mt-6">
                <h1 className="text-3xl font-semibold">Profile Summary</h1>
                <p className="mt-3 text-gray-400">
                  Building modern UI experiences
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setReveal(true)}
              className="px-6 py-3 bg-cyan-400 text-black rounded-xl font-semibold"
            >
              Scan & Reveal
            </button>
            <button
              onClick={() => setReveal(false)}
              className="px-6 py-3 bg-gray-800 rounded-xl"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
