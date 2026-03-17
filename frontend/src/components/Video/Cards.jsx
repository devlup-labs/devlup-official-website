import { useState, useMemo } from "react";

const videoIds = ["56xFUD8O9yI", "00Nphhrxb0o", "-NIiXIRuZj0","314S3-0_I2I","hlhy1QsZ4Bw","U-isVE5n4TY","WvQCFqRkaec","ZdTQ-bCDU0w"];

const CARD_WIDTH = 200;
const CARD_HEIGHT = 100;
const SIZE = CARD_WIDTH;
const MIN_DIST = 120;
const MAX_ATTEMPTS = 60;

const R1 = 75; const R2 = 150; const R3 = 220; const R4 = 300;
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
  const [selectedId, setSelectedId] = useState(null);

  const cards = useMemo(() => {
    const TOPBAR_HEIGHT = 56;
    const w = window.innerWidth - (CARD_WIDTH*1.5) - SIDE_OFFSET * 2;
    const h = window.innerHeight - TOPBAR_HEIGHT - (CARD_HEIGHT*1.5) - BOTTOM_OFFSET;

    const result = [];
    let id = 0;
    const count = Math.floor((w * h) / (SIZE * SIZE * 0.5));

    while (result.length < count) {
      let attempts = 0;
      let placed = false;
      while (!placed && attempts < MAX_ATTEMPTS) {
        const x = SIDE_OFFSET + (CARD_WIDTH / 2) + Math.random() * Math.max(0, w);
      const y = START_OFFSET_Y + (CARD_HEIGHT / 2) + Math.random() * Math.max(0, h - START_OFFSET_Y);

        if (result.every(c => Math.hypot(c.x - x, c.y - y) > MIN_DIST)) {
          const vId = videoIds[id % videoIds.length];
          result.push({
            id,
            videoId: vId,
            thumbnail: `https://img.youtube.com/vi/${vId}/mqdefault.jpg`,
            x,
            y,
            baseScale: 0.75 + Math.random() * 0.5,
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
    <div className="relative w-full h-screen overflow-hidden [background-image:var(--bg-main-gradient)] bg-[var(--bg-fallback)]" style={{ perspective: "1200px" }}>
      {selectedId !== null && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[15000]" onClick={() => setSelectedId(null)} />
      )}

      {cards.map(card => {
        let scale = card.baseScale;
        let zIndex = 1;
        let opacity = 0.88;
        const isSelected = card.id === selectedId;

        if (isSelected) {
          scale = 5;
          zIndex = 20000;
          opacity = 1;
        } else if (active) {
          const d = Math.hypot(card.x - active.x, card.y - active.y);
          if (card.id === activeId) { scale = HOVER_MAIN; zIndex = 6000; opacity = 1; }
          else if (d < R1) { scale = HOVER_R1; zIndex = 4000; }
          else if (d < R2) { scale = HOVER_R2; zIndex = 2500; }
          else if (d < R3) { scale = HOVER_R3; zIndex = 800; }
          else if (d < R4) { scale = HOVER_R4; zIndex = 400; }
        }

        return (
          <div
            key={card.id}
            onMouseEnter={() => setActiveId(card.id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => {
              if (isSelected) {
                window.open(`https://www.youtube.com/watch?v=${card.videoId}`, "_blank");
              } else {
                setSelectedId(card.id);
              }
            }}
            // Change this:


// To this (forces it to the exact center of the screen):
style={{
  left: isSelected ? "50%" : card.x,
  top: isSelected ? "50%" : card.y,
  position: isSelected ? "fixed" : "absolute", // Use fixed to ignore parent boundaries
  transform: isSelected 
    ? "translate(-50%, -50%) scale(4)" // Lower the scale if they are huge
    : `scale(${scale})`,
  zIndex: isSelected ? 99999 : zIndex,
}}
            className="absolute p-[1.5px] rounded-[18px] bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          >
            <div className="w-[200px] h-[100px] rounded-2xl overflow-hidden flex items-center justify-center bg-black shadow-lg">
              <img
                src={card.thumbnail}
                alt="youtube thumbnail"
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}