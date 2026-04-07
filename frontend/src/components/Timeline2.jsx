import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function CircularTimeline() {
  const ringRef = useRef(null);
  const centerTextRef = useRef(null);
  const descriptionRef = useRef(null);

  const isHoveringRing = useRef(false);

  const sliceAngle = 90;
  const radius = 600;
  const diameter = radius * 2;

  const startRotation = -sliceAngle / 2;

  // ✅ BACKEND SCHEMA DATA
  const events = Array.from({ length: 10 }, (_, i) => ({
    event_id: i + 1,
    event_title: `Event ${i + 1}`,
    event_subtitle: `Subtitle for Event ${i + 1}`,
    event_description: `This is a detailed description for Event ${i + 1}. This changes dynamically for each event.`,
    event_date: "2025-01-01",
    event_photos: [`https://picsum.photos/1200/1200?random=${i + 1}`]
  }));

  const [activeIndex, setActiveIndex] = useState(0);

  const rotationRef = useRef(startRotation);
  const proxy = useRef({ rotation: startRotation });

  const setRotate = useRef(null);

  const maxRotation = startRotation;
  const minRotation =
    startRotation - (events.length - 1) * sliceAngle;

  const theta = (sliceAngle * Math.PI) / 180;
  const endX = radius + radius * Math.sin(theta);
  const endY = radius - radius * Math.cos(theta);

  const sectorPath = `path("M${radius} ${radius} L${radius} 0 A${radius} ${radius} 0 0 1 ${endX} ${endY} Z")`;

  /* ================= INIT ================= */
  useEffect(() => {
    setRotate.current = gsap.quickSetter(
      ringRef.current,
      "rotate",
      "deg"
    );
    setRotate.current(startRotation);
  }, []);

  /* ================= ROTATION ================= */
  const updateRotation = (r) => {
    const clamped = Math.max(minRotation, Math.min(maxRotation, r));

    rotationRef.current = clamped;
    setRotate.current(clamped);

    const index = Math.round((startRotation - clamped) / sliceAngle);
    const safeIndex = Math.max(0, Math.min(events.length - 1, index));

    setActiveIndex((prev) => (prev !== safeIndex ? safeIndex : prev));
  };

  /* ================= SCROLL ================= */
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isHoveringRing.current) return;

      e.preventDefault();

      gsap.to(proxy.current, {
        rotation: proxy.current.rotation - e.deltaY * 0.25,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => updateRotation(proxy.current.rotation)
      });
    };

    const ring = ringRef.current;

    const onEnter = () => (isHoveringRing.current = true);
    const onLeave = () => (isHoveringRing.current = false);

    ring.addEventListener("mouseenter", onEnter);
    ring.addEventListener("mouseleave", onLeave);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      ring.removeEventListener("mouseenter", onEnter);
      ring.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  /* ================= CLICK ================= */
  const handleSliceClick = (clickedIndex) => {
    const targetRotation =
      startRotation - clickedIndex * sliceAngle;

    const newRotation = Math.max(
      minRotation,
      Math.min(maxRotation, targetRotation)
    );

    gsap.to(proxy.current, {
      rotation: newRotation,
      duration: 0.5,
      ease: "power3.out",
      onUpdate: () => updateRotation(proxy.current.rotation)
    });
  };

  /* ================= TEXT ================= */
  useEffect(() => {
    gsap.fromTo(
      centerTextRef.current,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.3 }
    );

    gsap.fromTo(
      descriptionRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
  }, [activeIndex]);

  const activeEvent = events[activeIndex];

  return (
    <div className="w-full min-h-screen bg-[var(--bg-fallback)] flex flex-col items-center">

      {/* HEADING */}
      <div className="text-center mt-24 mb-4">
        <h1 className="text-5xl font-bold uppercase">
          Our Learning Timeline
        </h1>
      </div>

      {/* DESCRIPTION (TOP) */}
      <div ref={descriptionRef} className="mb-6 max-w-2xl text-center">
        <p className="text-gray-400">
          {activeEvent.event_description}
        </p>
      </div>

      {/* RING */}
      <div className="relative w-[1200px] h-[780px] overflow-hidden">
        <div
          ref={ringRef}
          className="absolute rounded-full"
          style={{
            width: diameter,
            height: diameter,
            bottom: "-640px"
          }}
        >
          {events.map((event, i) => {
            const angle = i * sliceAngle;

            const normalized =
              rotationRef.current + angle + sliceAngle / 2;

            const isVisible = Math.abs(normalized) <= 180;

            return (
              <div
                key={event.event_id}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isVisible ? "auto" : "none"
                }}
              >
                <div
                  onClick={() => handleSliceClick(i)}
                  className="absolute w-full h-full cursor-pointer"
                  style={{ clipPath: sectorPath }}
                >
                  <img
                    src={event.event_photos[0]}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER */}
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[#090f1f] flex items-center justify-center pointer-events-none">
          <div ref={centerTextRef} className="text-center -translate-y-16">
            <h2 className="text-white text-4xl mb-10 font-bold uppercase">
              {activeEvent.event_title}
            </h2>

            {/* 📅 DATE */}
            <p className="text-xs text-gray-400 mb-4 tracking-wider uppercase">
              {new Date(activeEvent.event_date).toDateString()}
            </p>
            <p className="text-gray-400 mt-2 mb-33 text-sm">
              {activeEvent.event_subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}