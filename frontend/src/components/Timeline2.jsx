import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import TopControls from "../components/Video/TopControls";

export default function CircularTimeline() {
  const scrollRef = useRef(null);
  const textContainerRef = useRef(null);
  const glowRefs = useRef([]);

  const sliceAngle = 90;
  const radius = 600;
  const diameter = radius * 2;

  const startRotation = -45;

  const projects = Array.from({ length: 10 }, (_, i) => ({
    title: `Project ${i + 1}`,
    img: `https://picsum.photos/1200/1200?random=${i + 1}`
  }));

  const [smoothRotation, setSmoothRotation] = useState(startRotation);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  const targetRotation = useRef(startRotation);
  const proxyRef = useRef({ rotation: startRotation });

  const maxIndex = projects.length - 1;
  const maxRotation = startRotation;
  const minRotation = startRotation - maxIndex * sliceAngle;

  const theta = (sliceAngle * Math.PI) / 180;
  const endX = radius + radius * Math.sin(theta);
  const endY = radius - radius * Math.cos(theta);

  const sectorPath = `path("M${radius} ${radius} L${radius} 0 A${radius} ${radius} 0 0 1 ${endX} ${endY} Z")`;

  /* ================= SCROLL ================= */
  useEffect(() => {
    const el = scrollRef.current;

    const handleWheel = (e) => {
      const scrollFactor = 0.25;
      targetRotation.current -= e.deltaY * scrollFactor;

      targetRotation.current = Math.max(
        minRotation,
        Math.min(maxRotation, targetRotation.current)
      );

      gsap.to(proxyRef.current, {
        rotation: targetRotation.current,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          setSmoothRotation(proxyRef.current.rotation);
        }
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [maxRotation, minRotation]);

  /* ================= CLICK ================= */
  const handleSliceClick = (clickedIndex) => {
    const newTargetRotation = startRotation - clickedIndex * sliceAngle;
    targetRotation.current = newTargetRotation;

    gsap.to(proxyRef.current, {
      rotation: targetRotation.current,
      duration: 0.6,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => {
        setSmoothRotation(proxyRef.current.rotation);
      }
    });
  };

  const activeIndex = Math.round(
    Math.abs((smoothRotation - startRotation) / sliceAngle)
  );

  const clampedCenterIndex = Math.max(
    0,
    Math.min(activeIndex, projects.length - 1)
  );

  /* ================= GLOW + TEXT ================= */
  useEffect(() => {
    glowRefs.current.forEach((el, i) => {
      if (i !== clampedCenterIndex && el) {
        gsap.killTweensOf(el);
        gsap.to(el, { opacity: 0, duration: 0.4 });
      }
    });

    if (glowRefs.current[clampedCenterIndex]) {
      gsap.killTweensOf(glowRefs.current[clampedCenterIndex]);
      gsap.fromTo(
        glowRefs.current[clampedCenterIndex],
        { opacity: 0.3 },
        {
          opacity: 1,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }
      );
    }

    if (clampedCenterIndex !== displayedIndex) {
      const isAntiClockwise = clampedCenterIndex > displayedIndex;
      const dir = isAntiClockwise ? -1 : 1;

      gsap.killTweensOf(textContainerRef.current);

      gsap.to(textContainerRef.current, {
        opacity: 0,
        rotation: dir * 10,
        x: dir * 40,
        duration: 0.15,
        onComplete: () => {
          setDisplayedIndex(clampedCenterIndex);

          gsap.fromTo(
            textContainerRef.current,
            { opacity: 0, rotation: -dir * 10, x: -dir * 40 },
            {
              opacity: 1,
              rotation: 0,
              x: 0,
              duration: 0.3
            }
          );
        }
      });
    }
  }, [clampedCenterIndex, displayedIndex]);

  /* ================= UI ================= */
  return (
    <div
      ref={scrollRef}
      className="w-full h-screen bg-[var(--bg-fallback)] text-[var(--text-primary)] flex flex-col items-center overflow-hidden"
    >
      {/* 🔥 TOP CONTROLS */}
      <div className="fixed top-6 left-0 w-full flex justify-center z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          <TopControls />
        </div>
      </div>

      {/* HEADING */}
      <div className="text-center mt-24 mb-8 z-10 pointer-events-none">
        <h1 className="text-5xl font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Our Learning Timeline
        </h1>
        <p className="mt-3 text-[var(--text-muted)] uppercase tracking-widest text-sm font-semibold">
          explore the journey branch by branch
        </p>
      </div>

      {/* MAIN WHEEL */}
      <div className=" bg-[var] relative w-[1200px] h-[780px] overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: diameter,
            height: diameter,
            bottom: "-640px",
            transform: `rotate(${smoothRotation}deg)`
          }}
        >
          {projects.map((project, i) => {
            const angle = i * sliceAngle;
            const centerAngle = smoothRotation + angle + 45;
            const distanceFromCenter = Math.abs(centerAngle);

            const isVisible = distanceFromCenter <= 135;

            const centerProximity = Math.max(
              0,
              1 - Math.min(distanceFromCenter / 90, 1)
            );

            const brightness = 0.3 + centerProximity * 0.7;
            const scale = 1.0 + centerProximity * 0.05;

            return (
              <div
                key={i}
                className="absolute w-full h-full pointer-events-none"
                style={{
                  transform: `rotate(${angle}deg)`,
                  visibility: isVisible ? "visible" : "hidden"
                }}
              >
                {/* GLOW */}
                <div
                  ref={(el) => (glowRefs.current[i] = el)}
                  className="absolute w-full h-full opacity-0"
                  style={{
                    filter:
                      "drop-shadow(0px 0px 35px rgba(34, 211, 238, 0.9))"
                  }}
                >
                  <div
                    className="absolute w-full h-full"
                    style={{
                      clipPath: sectorPath,
                      backgroundColor: "rgba(34,211,238,0.35)"
                    }}
                  />
                </div>

                {/* IMAGE */}
                <div
                  onClick={() => handleSliceClick(i)}
                  className="absolute w-full h-full overflow-hidden cursor-pointer pointer-events-auto"
                  style={{ clipPath: sectorPath }}
                >
                  <div
                    className="relative w-full h-full transition-transform duration-300 hover:scale-[1.07]"
                    style={{
                      filter: `brightness(${brightness})`,
                      transform: `scale(${scale})`
                    }}
                  >
                    <img
                      src={project.img}
                      className="w-full h-full object-cover"
                      alt={project.title}
                    />

                    <div
                      className="absolute inset-0 bg-slate-900"
                      style={{ opacity: (1 - centerProximity) * 0.7 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER CARD */}
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[#090f1f] flex items-center justify-center z-10 pointer-events-auto border border-cyan-900/40 shadow-[inset_0_0_30px_rgba(34,211,238,0.05),_0_0_80px_rgba(0,0,0,0.9)]">
          <div
            ref={textContainerRef}
            className="text-center translate-y-[-100px]"
          >
            <h2 className="text-white text-4xl font-bold mb-3 uppercase tracking-widest">
              {projects[displayedIndex].title}
            </h2>

            <div className="w-12 h-[2px] bg-cyan-800 mb-5"></div>

            <button className="border border-cyan-600 text-cyan-50 px-8 py-3 text-xs font-semibold tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300">
              VIEW PROJECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}