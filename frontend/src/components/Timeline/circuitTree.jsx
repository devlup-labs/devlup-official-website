import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

export default function CircuitTree({ activeCard, flippedCards, branches, isMobile = false }) {
  const centerLineRef = useRef(null);
  const branchRefs = useRef([]);

  const data = Array.isArray(branches) ? branches : [];
  const LAST_Y = data.length ? data[data.length - 1].y + 2000 : 2000;

  /* ================= CENTER LINE DRAW ================= */
  useEffect(() => {

    const length = centerLineRef.current.getTotalLength();

    gsap.fromTo(
      centerLineRef.current,
      {
        strokeDasharray: length,
        strokeDashoffset: length,
      },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".scene",
          start: "top 70%",
          end: "bottom bottom",
          scrub: true,
        },
      }
    );
  }, [data]);

  /* ================= BRANCH DRAW (ONCE) ================= */
  useEffect(() => {
    branchRefs.current.forEach((path) => {
      if (!path) return;

      const pathId = path.getAttribute("data-id");
      const length = path.getTotalLength();

      gsap.fromTo(
        path,
        {
          strokeDasharray: length,
          strokeDashoffset: length,
        },
        {
          strokeDashoffset: 0,
          duration: 0.8, // Match the card appearing animation duration
          ease: "power3.out", // Match the card ease
          scrollTrigger: {
            trigger: `.roadmap-card[data-id="${pathId}"]`,
            start: "top 75%",
            once: true,
          },
        }
      );
    });
  }, [data]);



  /* ================= BRANCH FLIP ANIMATION ================= */
  useEffect(() => {
    data.forEach((b) => {
      const path = document.querySelector(
        `.branch-path[data-id="${b.id}"]`
      );
      if (!path) return;

      const targetSide = isMobile ? 1 : flippedCards?.[b.id] ? -b.side : b.side;

      gsap.to(path, {
        attr: {
          d: makeBranchPath(b, targetSide),
        },
        duration: 0.5,
        delay: flippedCards?.[b.id] ? 0.1 : 0,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  }, [flippedCards, data, isMobile]);

  /* ================= PATH HELPERS ================= */
  const SVG_WIDTH = isMobile ? 420 : 800;
  const STEM_X = isMobile ? 72 : 400;

  const makeBranchPath = (b, side) => {
    if (isMobile) {
      const branchSide = 1;
      const curveX = STEM_X + 75;
      const END_X = STEM_X + branchSide * 160;

      return `
        M${STEM_X} ${b.y - 260}
        V ${b.y - 15}
        Q ${STEM_X} ${b.y + 20}, ${curveX} ${b.y + 20}
        H ${END_X}
      `;
    }

    // Card center is at side * 250px from the center
    const curveX = STEM_X + side * 125;
    const END_X = STEM_X + side * 250;

    return `
      M${STEM_X} ${b.y - 260}
      V ${b.y - 15}
      Q ${STEM_X} ${b.y + 25}, ${curveX} ${b.y + 25}
      H ${END_X}
    `;
  };

  /* ================= RENDER ================= */
  return (
    <svg
      className={isMobile ? "absolute left-0 top-0 pointer-events-none overflow-visible" : "absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none overflow-visible"}
      width={SVG_WIDTH}
      height={LAST_Y + 200}
    >
      {/* ================= CENTER LINE ================= */}
      <path
        ref={centerLineRef}
        d={`M${STEM_X} 0 L${STEM_X} ${LAST_Y}`}
        stroke="#22d3ee"
        strokeWidth="4"
        fill="none"
        filter="url(#glow)"
      />

      {/* ================= BRANCHES ================= */}
      {data.map((b, index) => (
        <g
          key={b.id}
          className="branch-wrapper"
        >
          <path
            className="branch-path"
            data-id={b.id}
            ref={(el) => (branchRefs.current[index] = el)}
            d={makeBranchPath(b, b.side)}   // ⬅STATIC BASE SHAPE
            stroke="#22d3ee"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
          />

          {/* NODE */}
          <circle
            cx={STEM_X}
            cy={b.y}
            r="5"
            fill="#22d3ee"
            opacity="0"
          />
        </g>
      ))}

      {/* ================= GLOW ================= */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
