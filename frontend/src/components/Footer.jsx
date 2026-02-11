import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const refFooter = useRef(null);
  const refContent = useRef(null);
  const refWave = useRef(null);
  const refDot = useRef(null); 

  useGSAP(() => {
    const tl = gsap.timeline({
    scrollTrigger: {
      trigger: refFooter.current,
      start: "top 80%",      // footer enters viewport
      end: "bottom 60%",
      once: true,            // 🔥 play only once
     },
     });
    const columns = refContent.current.children;

    // 1. Setup initial states
    // Dot starts way above the screen
    gsap.set(refDot.current, { y: -500, opacity: 1, scale: 1 });
    // Wave is invisible and small
    gsap.set(refWave.current, { scale: 0, opacity: 0 });
    // Content columns are blurred and hidden
    gsap.set(columns, { opacity: 0, y: 30, filter: "blur(12px)" });

    // 2. The Dot drops from top to the center of the footer
    tl.to(refDot.current, {
      y: 0,
      duration: 0.7,
      ease: "power3.in", // Fast impact
    })
    
    // 3. Impact: Dot "shatters" into the wave
    .to(refDot.current, {
      scale: 2.5,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(refWave.current, {
      opacity: 1,
      scale: 10, // Massive expansion wave
      duration: 1.8,
      ease: "expo.out",
    }, "-=0.25") // Starts slightly before dot finishes shattering

    // 4. Reveal content from CENTER to END (Symmetrical reveal)
    .to(columns, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.5,
      stagger: {
        each: 0.12,
        from: "center"
      },
      ease: "power3.out"
    }, "-=1.6") // Triggers as the wave passes through the columns

    // 5. Cleanup: Ensure wave fades out completely
    .to(refWave.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "-=0.4");

  }, { scope: refFooter });

  return (
<div className="w-full bg-black text-white">
    

      {/* FOOTER (LAST) */}
      <footer
        ref={refFooter}
        className="relative w-full h-[200px] bg-[#020617] overflow-hidden flex items-center justify-center font-sans"
      >
        {/* Falling Dot */}
        <div
          ref={refDot}
          className="absolute z-40 w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_40px_rgba(96,165,250,1)]"
        />

        {/* Impact Wave */}
        <div
          ref={refWave}
          className="absolute z-10 w-40 h-40 border-[1.5px] border-blue-400 rounded-full bg-blue-500/5"
          style={{ boxShadow: "0 0 80px rgba(59,130,246,0.3)" }}
        />

        {/* ✅ FINAL CONTENT */}
        <div
          ref={refContent}
          className="relative w-full h-full max-w-8xl px-12 grid grid-cols-2 md:grid-cols-5 bg-[#0a0a0a] border border-green-500/20 font-mono"
        >
          <div className="p-6 border-r border-green-500/10">
            <h4 className="text-green-500 text-[10px] font-bold">
              /DEV/SOCIAL
            </h4>
          </div>

          <div className="p-6 border-r border-green-500/10">
            <h4 className="text-green-500 text-[10px] font-bold">
              /BIN/COMMUNITY
            </h4>
          </div>

          <div className="flex items-center justify-center bg-green-500/[0.03]">
            <h2 className="text-2xl font-black text-green-500">
              DEVLUP_LABS
            </h2>
          </div>

          <div className="p-6 border-l border-green-500/10">
            <h4 className="text-green-500 text-[10px] font-bold">
              /ETC/CLUB
            </h4>
          </div>

          <div className="p-6 border-l border-green-500/10">
            <h4 className="text-green-500 text-[10px] font-bold">
              /USR/HELP
            </h4>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;