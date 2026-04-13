import { useState, useMemo } from "react";
import { FaYoutube } from "react-icons/fa";

// Base dimensions for the background cards
const CARD_WIDTH = 220;
const CARD_HEIGHT = 124; 
const SIZE = CARD_WIDTH;
const MIN_DIST = 140; 
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

export default function Cards({ videoIds = ["56xFUD8O9yI", "00Nphhrxb0o", "-NIiXIRuZj0","314S3-0_I2I","hlhy1QsZ4Bw","U-isVE5n4TY","WvQCFqRkaec","ZdTQ-bCDU0w"] }) {
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const cards = useMemo(() => {
    const TOPBAR_HEIGHT = 56;
    const w = window.innerWidth - (CARD_WIDTH * 1.5) - SIDE_OFFSET * 2;
    const h = window.innerHeight - TOPBAR_HEIGHT - (CARD_HEIGHT * 1.5) - BOTTOM_OFFSET;

    const result = [];
    let id = 0;
    const count = Math.min(Math.floor((w * h) / (SIZE * SIZE * 0.45)), videoIds.length * 3); // cap count so not infinite loop if small array

    while (result.length < count && videoIds.length > 0) {
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
              thumbnail: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
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
    }, [videoIds]);
  
    const active = cards.find(c => c.id === activeId);

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* 🔥 BACKDROP (click outside to close) */}
      {selectedId !== null && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90000]"
          onClick={() => setSelectedId(null)}
        />
      )}

      {cards.map(card => {
        const isSelected = card.id === selectedId;

        let scale = card.baseScale;
        let zIndex = 1;
        let opacity = 0.88;

        // ❌ Disable ALL hover logic when video is open
        if (selectedId === null) {
          if (active) {
            const d = Math.hypot(card.x - active.x, card.y - active.y);
            if (card.id === activeId) { scale = HOVER_MAIN; zIndex = 6000; opacity = 1; }
            else if (d < R1) { scale = HOVER_R1; zIndex = 4000; }
            else if (d < R2) { scale = HOVER_R2; zIndex = 2500; }
            else if (d < R3) { scale = HOVER_R3; zIndex = 800; }
            else if (d < R4) { scale = HOVER_R4; zIndex = 400; }
          }
        }

        return (
          <div
            key={card.id}

            // ❌ Disable hover handlers when video open
            onMouseEnter={() => selectedId === null && setActiveId(card.id)}
            onMouseLeave={() => selectedId === null && setActiveId(null)}

            onClick={(e) => {
              e.stopPropagation();
              if (!isSelected) setSelectedId(card.id);
            }}

            style={{
              left: isSelected ? "50%" : card.x,
              top: isSelected ? "50%" : card.y,
              position: isSelected ? "fixed" : "absolute",

              transform: isSelected
                ? "translate(-50%, -50%) scale(1)"
                : `scale(${scale})`,

              width: isSelected ? "min(90vw, 1200px)" : `${CARD_WIDTH}px`,
              height: isSelected ? "min(50.6vw, 675px)" : `${CARD_HEIGHT}px`,

              zIndex: isSelected ? 99999 : zIndex,

              opacity: isSelected
                ? 1
                : (selectedId !== null ? 0.2 : opacity),

              // 🔥 KEY FIX: disable interaction
              pointerEvents:
                selectedId !== null && !isSelected ? "none" : "auto",
            }}

            className="transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group"
          >
            <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-black shadow-2xl border border-white/10">

              {isSelected ? (
                <div className="w-full h-full relative">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${card.videoId}?autoplay=1&modestbranding=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.youtube.com/watch?v=${card.videoId}`, "_blank");
                    }}
                    className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/60 hover:bg-red-600 backdrop-blur-xl text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all border border-white/20 shadow-2xl z-50 uppercase tracking-widest"
                  >
                    Watch on YouTube
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={card.thumbnail}
                    alt="thumbnail"
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <div className="absolute bg-white" style={{ width: '20px', height: '20px', zIndex: 0 }}></div>
                      <FaYoutube className="text-red-600 w-16 h-16 drop-shadow-2xl relative z-10" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}