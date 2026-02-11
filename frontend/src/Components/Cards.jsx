import { useState, useMemo } from "react";


const icons = [
  "👑","💎","🚀","🛡️","🔥","✨",
  "📁","📊","⚙️","🧠","⭐","💡",
  "🔒","❤️","🔍","🎮","📧","📶"
];

const CARD_WIDTH = 84;
const CARD_HEIGHT = 56;
const SIZE = CARD_WIDTH;

const MIN_DIST = 62;
const MAX_ATTEMPTS = 60;

// hover radii
const R1 = 75;
const R2 = 150;
const R3 = 220;
const R4 = 300;

// hover scales
const HOVER_MAIN = 2.4;
const HOVER_R1 = 1.65;
const HOVER_R2 = 1.4;
const HOVER_R3 = 1.25;
const HOVER_R4 = 1.08;

const START_OFFSET_Y = 34;
const BOTTOM_OFFSET = 44;
const SIDE_OFFSET = 32;

export default function Cards() {
  const [activeId, setActiveId] = useState(null);

  const cards = useMemo(() => {
    const TOPBAR_HEIGHT = 56;

    const w = window.innerWidth - CARD_WIDTH - SIDE_OFFSET * 2;
    const h =
      window.innerHeight -
      TOPBAR_HEIGHT -
      CARD_HEIGHT -
      BOTTOM_OFFSET;

    const result = [];
    let id = 0;

    const count = Math.floor((w * h) / (SIZE * SIZE * 0.35));

    while (result.length < count) {
      let attempts = 0;
      let placed = false;

      while (!placed && attempts < MAX_ATTEMPTS) {
        const x =
          SIDE_OFFSET + Math.random() * Math.max(0, w);
        const y =
          START_OFFSET_Y +
          Math.random() * Math.max(0, h - START_OFFSET_Y);

        const ok = result.every(c => {
          const dx = c.x - x;
          const dy = c.y - y;
          return Math.hypot(dx, dy) > MIN_DIST;
        });

        if (ok) {
          result.push({
            id,
            icon: icons[id % icons.length],
            x,
            y,
            baseScale: 0.75 + Math.random() * 0.5
          });
          id++;
          placed = true;
        }

        attempts++;
      }

      if (!placed) break;
    }

    return result;
  }, []);

  const active = cards.find(c => c.id === activeId);

  return (
    <div
      className="
        relative
        w-full h-screen
        overflow-hidden
        bg-[#0a0b0f]
      "
    >
      {cards.map(card => {
        let scale = card.baseScale;
        let zIndex = 1;
        let opacity = 0.88;

        const individuality = 0.95 + card.baseScale * 0.1;

        if (active) {
          const dx = card.x - active.x;
          const dy = card.y - active.y;
          const d = Math.hypot(dx, dy);

          if (card.id === activeId) {
            scale = HOVER_MAIN * individuality;
            zIndex = 5000;
            opacity = 1;
          } else if (d < R1) {
            scale = HOVER_R1 * individuality;
            zIndex = 3000;
            opacity = 0.95;
          } else if (d < R2) {
            scale = HOVER_R2 * individuality;
            zIndex = 2000;
            opacity = 0.85;
          } else if (d < R3) {
            scale = HOVER_R3 * individuality;
            zIndex = 30;
            opacity = 0.75;
          } else if (d < R4) {
            scale = HOVER_R4 * individuality;
            zIndex = 20;
            opacity = 0.65;
          }
        }

        return (
          <div
            key={card.id}
            onMouseEnter={() => setActiveId(card.id)}
            onMouseLeave={() => setActiveId(null)}
            style={{
              left: card.x,
              top: card.y,
              transform: `scale(${scale})`,
              zIndex,
              opacity
            }}
            className="
              absolute
              w-[84px] h-[56px]
              rounded-2xl
              flex items-center justify-center

              bg-gradient-to-b
              from-[rgba(30,32,52,0.97)]
              to-[rgba(18,20,34,0.97)]

              border border-white/10

              shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_6px_18px_rgba(0,0,0,0.45)]

              transition-transform transition-opacity
              duration-[550ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
            "
          >
            <span className="text-[32px] leading-none pointer-events-none">
              {card.icon}
            </span>
          </div>
        );
      })}
    </div>
  );
}
