
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

 const CARD_WIDTH = 260;
 const CARD_OFFSET = 220; // distance from stem to card center

  return (
    <div
      className="absolute roadmap-card "
       data-id={id}
      style={{
        top: y - 50,
         left: "50%",
         transform: `translateX(${side * CARD_OFFSET - CARD_WIDTH / 2}px)`
      }}
    >
      <div
        ref={card}
        onClick={handleClick}
        className="cursor-pointer w-[260px] h-[100px] bg-slate-900
                   rounded-xl border border-cyan-400 
                   p-5 text-white relative"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: side === 1 ? "left center" : "right center",
        }}
      >
        <div className="card-face absolute inset-0 flex items-center justify-center p-4 [backface-visibility:hidden]">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
       <div
  className="
    card-face
    card-back
    absolute inset-0
    flex items-center justify-center
    p-4
    [backface-visibility:hidden]
    [transform:rotateY(180deg)]
  "
>
      <p className="text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}
