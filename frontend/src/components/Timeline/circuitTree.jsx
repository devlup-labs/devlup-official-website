
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { branches } from "./data";

gsap.registerPlugin(ScrollTrigger);

export default function CircuitTree({ activeCard, flippedCards }) {
  const centerLineRef = useRef(null);
  const branchRefs = useRef([]);

  const LAST_Y = branches[branches.length - 1].y + 2000;

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
  }, []);

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
  }, []);



  /* ================= BRANCH FLIP ANIMATION ================= */
  useEffect(() => {
    branches.forEach((b) => {
      const path = document.querySelector(
        `.branch-path[data-id="${b.id}"]`
      );
      if (!path) return;

      const targetSide = flippedCards?.[b.id]
        ? -b.side
        : b.side;

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
  }, [flippedCards]);

  /* ================= PATH HELPERS ================= */
  const STEM_X = 400;

  const makeBranchPath = (b, side) => {
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
      className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none overflow-visible"
      width="800"
      height={LAST_Y + 200}
    >
      {/* ================= CENTER LINE ================= */}
      <path
        ref={centerLineRef}
        d={`M400 0 L400 ${LAST_Y}`}
        stroke="#22d3ee"
        strokeWidth="4"
        fill="none"
        filter="url(#glow)"
      />

      {/* ================= BRANCHES ================= */}
      {branches.map((b, index) => (
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
            cx="400"
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
