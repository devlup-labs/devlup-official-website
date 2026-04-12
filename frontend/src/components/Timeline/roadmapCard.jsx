import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RoadmapCard({
  id,
  side,
  y,
  title,
  date,
  description,
  isActive,
  onActivate,
  onDeactivate,
  onFlip,
}) {
  const card = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      card.current,
      { opacity: 0, scale: 0.6 },
      {
        opacity: 1,
        scale: 1,
        scrollTrigger: {
          trigger: card.current,
          start: "top 75%",
          once: true,
        },
        duration: 0.8,
        ease: "power3.out",
      }
    );
  }, []);

  useEffect(() => {
    if (!card.current) return;

    const rect = card.current.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const cardCenterX = rect.left + rect.width / 2;
    const deltaX = viewportCenterX - cardCenterX;

    gsap.to(card.current, {
      x: isActive ? deltaX : 0,
      rotateY: isActive ? side * 180 : 0,
      scale: isActive ? 1.6 : 1,
      z: isActive ? 120 : 0,
      duration: 1.2,
      ease: "power4.out",
      delay: isActive ? 0.3 : 0,
      overwrite: "auto",
    });
  }, [isActive, side]);

  const handleClick = () => {
    if (isActive) {
      onDeactivate();
      onFlip(false); // unflipped
    } else {
      onActivate();
      onFlip(true); //  flipped
    }
  };

  const CARD_WIDTH = 350;
  const CARD_OFFSET = 250; 

  return (
    <div
      className="absolute roadmap-card"
      data-id={id}
      style={{
        top: y - 50,
        left: "50%",
        transform: `translateX(${side * CARD_OFFSET - CARD_WIDTH / 2}px)`,
      }}
    >
      <div
        ref={card}
        onClick={handleClick}
        className="cursor-pointer relative"
        style={{
          width: `${CARD_WIDTH}px`,
          height: "150px",
          transformStyle: "preserve-3d",
          transformOrigin: side === 1 ? "left center" : "right center",
        }}
      >
        {/* --- FRONT FACE (SUMMARY STATE - LIKE PHASE 2 IN IMAGE) --- */}
        <div 
          className="card-face absolute inset-0 flex flex-col [backface-visibility:hidden] 
                     bg-[#f4f3ed] rounded-xl bg-[var(--bg-blog_card)] text-white border border-white/10  overflow-hidden"
        >
          {/* Top light section with Image & Title */}
          <div className="flex-1 flex items-stretch p-1.5 gap-4">
            {/* Image Placeholder (Matches the light blue sky box) */}
            <div className="w-[100px] bg-gradient-to-br from-[#8bbcf1] to-[#e0efff] rounded shadow-inner">
              <img src="public/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>

            {/* Text Area */}
            <div className="flex flex-col justify-center py-1">
              <div className="text-[13px]  font-bold tracking-wide flex items-center gap-1.5">
              
                {title || "PHASE 2"}
              </div>
              <p className="text-[12px]  font-semibold tracking-wide mt-0.5">
                PROJECT EXECUTION
              </p>
            </div>
          </div>

          {/* Bottom dark bar with date */}
          <div className="h-[42px] bg-[#1a2333] px-3 flex items-center border-t border-[#c2a773]/30">
            <span className="text-[11px] text-slate-300 font-medium tracking-wide">
              {date || "MAY 15, 2024"}
            </span>
          </div>
        </div>

        {/* --- BACK FACE (DETAILED STATE - LIKE PHASE 1 IN IMAGE) --- */}
        <div
          className="card-face card-back absolute inset-0 flex flex-col justify-between p-4 [backface-visibility:hidden] 
                     [transform:rotateY(180deg)] rounded-xl bg-[var(--bg-blog_card)] text-white border border-white/10  overflow-hidden"
        >
          {/* Top text content */}
          <div>
            <h3 className="text-[13px] font-black text-bold uppercase leading-snug mb-2 tracking-tight">
              Timeline Detailed Analysis: <br />
              <span className="">{title || "PHASE 1 ACHIEVEMENTS"}</span>
            </h3>
            <p className="text-[11px]  leading-relaxed line-clamp-3 font-medium">
              {description || "This card contains information of Phase 1. Detailed description about the milestones and goals achieved in this phase."}
            </p>
          </div>

          {/* Bottom Footer (DevUp Labs Branding Restored) */}
          {/* <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-2"> */}
              {/* Pseudo Logo (Overlapping colored shapes) */}
              {/* <div className="relative w-4 h-4 flex-shrink-0">
                <div className="absolute left-0 w-2.5 h-4 bg-[#3b82f6] rounded-full"></div>
                <div className="absolute right-0 w-2.5 h-4 bg-[#f43f5e] rounded-full opacity-90"></div>
              </div>
              <span className="text-[11px] font-bold text-[#2d3748] tracking-tight">DevUp Labs</span>
            </div>
            <span className="text-[10px] text-[#718096] font-semibold tracking-wide">Our Learning Timeline</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}