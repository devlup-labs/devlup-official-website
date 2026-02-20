import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { ThemeContext } from "../App";

const teamMembers = [
  {
    name: "Luffy",
    role: "Founder",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o1.jpeg",
  },
  {
    name: "Monkey D. Luffy",
    role: "Creative Director",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o2.jpeg",
  },
  {
    name: "Luffy chan",
    role: "Lead Developer",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o4.jpeg",
  },
  {
    name: "Lucy",
    role: "UX Designer",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o3.jpeg",
  },
  {
    name: "Luffy kun",
    role: "Marketing Manager",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o5.jpeg",
  },
  {
    name: "Monkey chan",
    role: "Product Manager",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o6.jpeg",
  },
];

export default function Podcast() {
  const wrapperRef = useRef(null);

  const { isDarkMode } = useContext(ThemeContext);

  /* ================= STATE ================= */
  const [pos, setPos] = useState(0);

  const velocity = useRef(0);
  const raf = useRef(null);

  const max = teamMembers.length;

  /* ================= ANIMATION LOOP ================= */
  const animate = () => {
    velocity.current *= 0.92; // friction

    let next = pos + velocity.current;

    if (next < 0) {
      next = 0;
      velocity.current = 0;
    }

    if (next > max) {
      next = max;
      velocity.current = 0;
    }

    if (Math.abs(velocity.current) < 0.001) {
      next = Math.round(next);
      velocity.current = 0;
    }

    setPos(next);

    raf.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  });

  /* ================= WHEEL ================= */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      velocity.current += e.deltaY * 0.0007;
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ================= RING GEOMETRY ================= */
  const radius = 420;
  const step = (2 * Math.PI) / teamMembers.length;

  const cardStyle = (i) => {
    const angle = (i - pos) * step;

    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius - radius;

    const scale = 1 - Math.abs(angle) * 0.15;

    const opacity = Math.max(0.2, 1 - Math.abs(angle));

    return {
      transform: `
        translate(-50%, -50%)
        translateX(${x}px)
        translateZ(${z}px)
        rotateY(${angle * 40}deg)
        scale(${scale})
      `,
      opacity,
      zIndex: 1000 - Math.abs(z),
    };
  };

  /* ================= JSX ================= */
  return (
    <div
      ref={wrapperRef}
      className="
        min-h-screen
        flex items-center justify-center
        overflow-hidden
        bg-[var(--bg-main)]
        text-[var(--text-primary)]
        transition-colors duration-500
      "
    >
      <div className="flex max-w-[1300px] w-full items-center gap-24 px-10 md:flex-row flex-col">

        {/* CAROUSEL */}
        <div className="flex-1 relative h-[70vh] perspective-[1400px]">

          <div className="relative w-full h-full preserve-3d">

            {teamMembers.map((m, i) => (
              <div
                key={i}
                style={cardStyle(i)}
                className="
                  absolute left-1/2 top-1/2
                  w-[380px] h-[220px]
                  rounded-2xl
                  bg-[var(--bg-surface)]
                  border border-white/10
                  shadow-xl
                  transform-3d
                  transition-[transform,opacity]
                  duration-200
                  ease-out
                  overflow-hidden
                  backdrop-blur-xl
                "
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

          </div>
        </div>

        {/* INFO */}
        <div className="flex-1 text-center space-y-4">

          <h2 className="text-4xl font-bold">
            {teamMembers[Math.round(pos) % teamMembers.length].name}
          </h2>

          <p className="text-[var(--text-secondary)] uppercase tracking-widest">
            {teamMembers[Math.round(pos) % teamMembers.length].role}
          </p>

          {/* DOTS */}
          <div className="flex justify-center gap-3 pt-6">

            {teamMembers.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  velocity.current = i - pos;
                }}
                className={`
                  w-3 h-3 rounded-full cursor-pointer transition
                  ${
                    Math.round(pos) % teamMembers.length === i
                      ? "bg-[var(--accent-primary)] scale-125"
                      : "bg-[var(--text-secondary)]/40"
                  }
                `}
              />
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}