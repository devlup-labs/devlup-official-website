import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const Footer = () => {
  const refFooter = useRef(null);
  const refContent = useRef(null);
  const refWave = useRef(null);
  const refDot = useRef(null); 

  useGSAP(() => {
    const tl = gsap.timeline();
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
      duration: 1.5,
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
    }, "-=1.2") // Triggers as the wave passes through the columns

    // 5. Cleanup: Ensure wave fades out completely
    .to(refWave.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "-=0.4");

  }, { scope: refFooter });

  return (
    <footer 
      ref={refFooter} 
      className="absolute w-full h-[300px] bg-[#020617] overflow-hidden flex items-center justify-center text-white font-sans"
    >
      {/* The Falling Energy Dot */}
      <div 
        ref={refDot}
        className="absolute z-40 w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_40px_rgba(96,165,250,1)] pointer-events-none"
      />

      {/* The Impact Wave (Expanding Ring) */}
      <div 
        ref={refWave}
        className="absolute z-10 w-40 h-40 border-[1.5px] border-blue-400/100 rounded-full bg-blue-500/5 pointer-events-none"
        style={{ boxShadow: '0 0 80px rgba(59, 130, 246, 0.3)' }}
      />

      {/* Footer Content revealed by the wave */}
 <div 
  ref={refContent} 
  className="relative w-full h-full max-w-8xl px-12 grid grid-cols-2 md:grid-cols-5 gap-0 bg-[#0a0a0a] border border-green-500/20 font-mono"
>
  {/* Column 1: Social */}
  <div className="p-6 border-r border-green-500/10 hover:bg-green-500/[0.02] transition-colors group">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-green-500 text-[10px] font-bold tracking-tighter">/DEV/SOCIAL</h4>
      <span className="text-green-900 text-[8px]">DIR</span>
    </div>
    <div className="space-y-2">
      <a href="#" className="flex items-center text-gray-500 hover:text-green-400 text-[11px] group-hover:translate-x-1 transition-transform">
        <span className="mr-2 text-green-800 opacity-50">{'>'}</span> INSTAGRAM
      </a>
      <a href="#" className="flex items-center text-gray-500 hover:text-green-400 text-[11px] group-hover:translate-x-1 transition-transform">
        <span className="mr-2 text-green-800 opacity-50">{'>'}</span> FACEBOOK
      </a>
    </div>
  </div>

  {/* Column 2: Community */}
  <div className="p-6 border-r border-green-500/10 hover:bg-green-500/[0.02] transition-colors">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-green-500 text-[10px] font-bold tracking-tighter">/BIN/COMMUNITY</h4>
      <span className="text-green-900 text-[8px]">EXE</span>
    </div>
    <div className="space-y-2 text-[11px]">
      <a href="#" className="block text-gray-500 hover:text-green-400">./DEVELOPERS</a>
      <a href="#" className="block text-gray-500 hover:text-green-400">./DISCORD</a>
    </div>
  </div>

  {/* Column 3: Center Branding - The Logo */}
  <div className="flex flex-col items-center justify-center p-6 bg-green-500/[0.03] relative overflow-hidden">
    {/* Subtle CRT Scanline effect */}
    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
    
    <h2 className="text-2xl font-black text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] tracking-tight">
      DEVLUP_LABS
    </h2>
    <div className="mt-2 text-[8px] text-green-800 animate-pulse">
      STATUS: ENCRYPTED
    </div>
  </div>

  {/* Column 4: Club */}
  <div className="p-6 border-l border-green-500/10 hover:bg-green-500/[0.02] transition-colors text-right md:text-left">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-green-500 text-[10px] font-bold tracking-tighter">/ETC/CLUB</h4>
      <span className="text-green-900 text-[8px]">CFG</span>
    </div>
    <div className="space-y-2 text-[11px]">
      <a href="#" className="block text-gray-500 hover:text-green-400 hover:underline decoration-green-500/50">ABOUT.md</a>
      <a href="#" className="block text-gray-500 hover:text-green-400 hover:underline decoration-green-500/50">BLOG.rss</a>
    </div>
  </div>

  {/* Column 5: Help */}
  <div className="p-6 border-l border-green-500/10 hover:bg-green-500/[0.02] transition-colors text-right md:text-left">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-green-500 text-[10px] font-bold tracking-tighter">/USR/HELP</h4>
      <span className="text-green-900 text-[8px]">LOG</span>
    </div>
    <div className="space-y-3">
      <a href="#" className="block text-gray-500 hover:text-green-400 text-[11px]">SUPPORT</a>
      <button className="w-full py-1 px-2 border border-green-500/40 text-green-500 text-[9px] hover:bg-green-500 hover:text-black transition-all">
        SUDO CONTACT
      </button>
    </div>
  </div>
</div>

      {/* Subtle Background Glow */}
      {/* <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none" /> */}
    </footer>
  );
};

export default Footer;