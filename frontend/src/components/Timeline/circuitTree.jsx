
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { branches } from "./data";

gsap.registerPlugin(ScrollTrigger);

export default function CircuitTree({ activeCard, flippedCards }) {
  const centerLineRef = useRef(null);
  const branchRefs = useRef([]);

  const LAST_Y = branches[branches.length - 1].y + 4000;

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
          end: "center center",
          scrub: true,
        },
      }
    );
  }, []);

  /* ================= BRANCH DRAW (ONCE) ================= */
  useEffect(() => {
    branchRefs.current.forEach((path) => {
      if (!path) return;

      const length = path.getTotalLength();

      gsap.fromTo(
        path,
        {
          strokeDasharray: length,
          strokeDashoffset: length,
        },
        {
          strokeDashoffset: 0,
          ease: "power1.out",
          scrollTrigger: {
            trigger: path.closest(".branch-wrapper"),
            start: "top 75%",
            end: "top 0%",
            // scrub: true,
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
        delay: flippedCards?.[b.id] ? 0.7 : 0,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  }, [flippedCards]);

  /* ================= PATH HELPERS ================= */
  const STEM_X = 350;

  const makeBranchPath = (b, side) => {
    const curveX = STEM_X + side * 90;
    const END_X = STEM_X + side * 180;

    return `
      M${STEM_X} ${b.y - 260}
      V ${b.y - 20}
      Q ${STEM_X} ${b.y + 20}, ${curveX} ${b.y + 20}
      H ${END_X}
    `;
  };

  /* ================= RENDER ================= */
  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
      width="800"
      height={LAST_Y + 150}
      viewBox={`0 0 750 ${LAST_Y + 200}`}
    >
      {/* ================= CENTER LINE ================= */}
      <path
        ref={centerLineRef}
        d={`M350 0 L350 ${LAST_Y}`}
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
            d={makeBranchPath(b, b.side)}   // ⬅️ STATIC BASE SHAPE
            stroke="#22d3ee"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
          />

          {/* NODE */}
          <circle
            cx="350"
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
