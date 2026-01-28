
import { useState, useMemo } from "react";
import "./Cards.css";

const icons = [
  "👑","💎","🚀","🛡️","🔥","✨",
  "📁","📊","⚙️","🧠","⭐","💡",
  "🔒","❤️","🔍","🎮","📧","📶"
];

const CARD_WIDTH = 84;
const CARD_HEIGHT = 56;
const SIZE = CARD_WIDTH; // used for spacing logic

const MIN_DIST = 62;
const MAX_ATTEMPTS = 60;

// hover radii (R5 removed)
const R1 = 75;
const R2 = 150;
const R3 = 220;
const R4 = 300;

// normalized hover scales
const HOVER_MAIN = 2.4;
const HOVER_R1 = 1.65;
const HOVER_R2 = 1.40;
const HOVER_R3 = 1.25;
const HOVER_R4 = 1.08;

const START_OFFSET_Y = 34; // controls gap below search bar
const BOTTOM_OFFSET = 44; 
const SIDE_OFFSET = 32; // left & right breathing space

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
  SIDE_OFFSET +
  Math.random() * Math.max(0, w);
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
    <div className="scene">
      {cards.map(card => {
        let scale = card.baseScale;
        let zIndex = 1;
        let opacity = 0.88;

        // subtle individuality (kept small)
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
            className="card"
            style={{
              left: card.x,
              top: card.y,
              transform: `scale(${scale})`,
              zIndex,
              opacity
            }}
            onMouseEnter={() => setActiveId(card.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <span className="icon">{card.icon}</span>
          </div>
        );
      })}
    </div>
  );
}
