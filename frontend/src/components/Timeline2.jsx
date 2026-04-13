import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { getTimeline } from "../api/services";

export default function CircularTimeline() {
  // 1. STATE & DATA (Must be at the top)
  const [timeline, setTimeline] = useState([]); // Initialized as array
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // 2. BACKEND INTEGRATION
  useEffect(() => {
    getTimeline()
      .then(res => {
        // Your JSON structure is { "success": true, "data": [...] }
        // Axios puts the JSON body in 'res.data'
        // So the array is at 'res.data.data'
        if (res.data && Array.isArray(res.data.data)) {
          setTimeline(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // 3. REFS & CONSTANTS (GSAP Logic - Untouched)
  const ringRef = useRef(null);
  const centerTextRef = useRef(null);
  const descriptionRef = useRef(null);
  const isHoveringRing = useRef(false);
  const setRotate = useRef(null);

  // Ensure 'events' is always an array to prevent .map errors
  const events = Array.isArray(timeline) ? timeline : [];

  const sliceAngle = 90;
  const radius = 600;
  const diameter = radius * 2;
  const startRotation = -sliceAngle / 2;

  const rotationRef = useRef(startRotation);
  const proxy = useRef({ rotation: startRotation });

  const maxRotation = startRotation;
  const minRotation = events.length > 0
    ? startRotation - (events.length - 1) * sliceAngle
    : startRotation;

  const theta = (sliceAngle * Math.PI) / 180;
  const endX = radius + radius * Math.sin(theta);
  const endY = radius - radius * Math.cos(theta);
  const sectorPath = `path("M${radius} ${radius} L${radius} 0 A${radius} ${radius} 0 0 1 ${endX} ${endY} Z")`;

  /* ================= INIT ================= */
  useEffect(() => {
    if (!loading && ringRef.current) {
      setRotate.current = gsap.quickSetter(ringRef.current, "rotate", "deg");
      setRotate.current(startRotation);
    }
  }, [loading]);

  /* ================= ROTATION ================= */
  const updateRotation = (r) => {
    if (events.length === 0) return;
    const clamped = Math.max(minRotation, Math.min(maxRotation, r));

    rotationRef.current = clamped;
    if (setRotate.current) setRotate.current(clamped);

    const index = Math.round((startRotation - clamped) / sliceAngle);
    const safeIndex = Math.max(0, Math.min(events.length - 1, index));

    setActiveIndex((prev) => (prev !== safeIndex ? safeIndex : prev));
  };

  /* ================= SCROLL ================= */
  useEffect(() => {
    if (loading || events.length === 0) return;

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

    if (ring) {
      ring.addEventListener("mouseenter", onEnter);
      ring.addEventListener("mouseleave", onLeave);
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (ring) {
        ring.removeEventListener("mouseenter", onEnter);
        ring.removeEventListener("mouseleave", onLeave);
      }
      window.removeEventListener("wheel", handleWheel);
    };
  }, [loading, events.length]);

  /* ================= CLICK ================= */
  const handleSliceClick = (clickedIndex) => {
    const targetRotation = startRotation - clickedIndex * sliceAngle;
    const newRotation = Math.max(minRotation, Math.min(maxRotation, targetRotation));

    gsap.to(proxy.current, {
      rotation: newRotation,
      duration: 0.5,
      ease: "power3.out",
      onUpdate: () => updateRotation(proxy.current.rotation)
    });
  };

  /* ================= TEXT ANIMATION ================= */
  useEffect(() => {
    if (loading || events.length === 0) return;

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
  }, [activeIndex, loading]);

  /* ================= RENDER GUARDS ================= */
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]">Loading...</div>;
  if (events.length === 0) return <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]">No data found.</div>;

  // Safe access to the active event
  const activeEvent = events[activeIndex] || {};

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {/* HEADING */}
      <div className="text-center mt-24 mb-4">
        <h1 className="text-5xl font-bold uppercase">Our Timeline</h1>
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
            const normalized = rotationRef.current + angle + sliceAngle / 2;
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
                    alt={event.event_title}
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
              {activeEvent.event_date ? new Date(activeEvent.event_date).toDateString() : ""}
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