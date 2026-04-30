import { useState, useEffect, useMemo, useContext } from "react";
import { FaYoutube } from "react-icons/fa";
import { getVideoIds } from "../../api/services";
import { ThemeContext } from "../../App";

// Base dimensions for the background cards
const CARD_WIDTH = 300;
const CARD_HEIGHT = 144;
const SIZE = CARD_WIDTH;
const MAX_ATTEMPTS = 50;

const R1 = 75; const R2 = 150; const R3 = 220; const R4 = 300;
const HOVER_MAIN = 2.4;
const HOVER_R1 = 1.65;
const HOVER_R2 = 1.4;
const HOVER_R3 = 1.25;
const HOVER_R4 = 1.08;

const START_OFFSET_Y = 88; // Start below header
const BOTTOM_OFFSET = 44;
const SIDE_OFFSET = 32;

export default function Cards({ videos: propVideos }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [internalVideoData, setInternalVideoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (propVideos && propVideos.length > 0) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const res = await getVideoIds();
        if (!isMounted) return;
        const raw = res.data || [];
        const normalized = raw.map((v) => ({
          id: typeof v === "string" ? v : v.videoId,
          title: v.title ?? "",
          description: v.description ?? "",
        }));
        setInternalVideoData(normalized);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchVideos();
    return () => { isMounted = false; };
  }, [propVideos]);

  const displayVideos = useMemo(() => {
    if (propVideos && propVideos.length > 0) return propVideos;
    return internalVideoData;
  }, [propVideos, internalVideoData]);

  const cards = useMemo(() => {
    if (!displayVideos || displayVideos.length === 0) return [];

    const winWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    const isMobile = winWidth < 768;
    const cw = isMobile ? 140 : CARD_WIDTH;
    const ch = isMobile ? 80 : CARD_HEIGHT;
    const initialMinDist = isMobile ? 90 : 160;
    
    const w = Math.max(isMobile ? 150 : 0, winWidth - (cw * 1.5) - SIDE_OFFSET * 2);
    const h = Math.max(isMobile ? 300 : 0, winHeight - START_OFFSET_Y - (ch * 1.5) - BOTTOM_OFFSET);

    const result = [];
    
    displayVideos.forEach((video, index) => {
      let attempts = 0;
      let placed = false;
      let currentMinDist = initialMinDist;
      const vId = video.id || video.videoId;

      while (!placed && attempts < MAX_ATTEMPTS) {
        const x = SIDE_OFFSET + (cw / 2) + Math.random() * w;
        const y = START_OFFSET_Y + (ch / 2) + Math.random() * h;

        if (attempts > 30) currentMinDist *= 0.8;

        if (result.every(c => Math.hypot(c.x - x, c.y - y) > currentMinDist)) {
          result.push({
            id: index,
            videoId: vId,
            thumbnail: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
            x,
            y,
            baseScale: 0.75 + Math.random() * 0.4,
            cw,
            ch
          });
          placed = true;
        }
        attempts++;
      }
      
      if (!placed) {
        result.push({
          id: index,
          videoId: vId,
          thumbnail: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
          x: SIDE_OFFSET + (cw / 2) + Math.random() * w,
          y: START_OFFSET_Y + (ch / 2) + Math.random() * h,
          baseScale: 1,
          cw,
          ch
        });
      }
    });

    return result;
  }, [displayVideos]);

  if (loading && (!propVideos || propVideos.length === 0)) {
    return (
      <div 
        className="h-screen flex items-center justify-center transition-all duration-500"
        style={{
          backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
        }}
      >
        <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const active = cards.find(c => c.id === activeId);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden transition-all duration-500"
      style={{
        backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
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
        let opacity = 0.85;
        let blur = 0;

        if (selectedId === null && active) {
          const d = Math.hypot(card.x - active.x, card.y - active.y);
          if (card.id === activeId) { 
            scale = HOVER_MAIN; 
            zIndex = 6000; 
            opacity = 1; 
          }
          else if (d < R1) { scale = HOVER_R1; zIndex = 4000; opacity = 0.95; }
          else if (d < R2) { scale = HOVER_R2; zIndex = 2500; opacity = 0.9; }
          else if (d < R3) { scale = HOVER_R3; zIndex = 800; opacity = 0.8; }
          else if (d < R4) { scale = HOVER_R4; zIndex = 400; opacity = 0.7; }
          else {
             opacity = 0.4;
             blur = 1;
          }
        } else if (selectedId !== null && !isSelected) {
           opacity = 0.15;
           blur = 4;
        }

        return (
          <div
            key={card.id}
            onMouseEnter={() => selectedId === null && setActiveId(card.id)}
            onMouseLeave={() => selectedId === null && setActiveId(null)}
            onTouchStart={() => selectedId === null && setActiveId(card.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSelected) setSelectedId(card.id);
            }}
            style={{
              left: isSelected ? "50%" : `${card.x}px`,
              top: isSelected ? "50%" : `${card.y}px`,
              position: isSelected ? "fixed" : "absolute",
              transform: isSelected
                ? "translate3d(-50%, -50%, 0) scale(1)"
                : `translate3d(-50%, -50%, 0) scale(${scale})`,
              width: isSelected ? "min(90vw, 1200px)" : `${card.cw}px`,
              height: isSelected ? "min(50.6vw, 675px)" : `${card.ch}px`,
              zIndex: isSelected ? 99999 : zIndex,
              opacity: opacity,
              filter: `blur(${blur}px)`,
              pointerEvents: selectedId !== null && !isSelected ? "none" : "auto",
              willChange: "transform, opacity, filter"
            }}
            className="transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group"
          >
            <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-[var(--bg-surface)] shadow-2xl border border-[var(--border-subtle)] transition-colors duration-500">
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
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={card.thumbnail}
                    alt="thumbnail"
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <FaYoutube className="text-red-600 w-16 h-16" />
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