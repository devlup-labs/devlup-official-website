import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
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
        start: "top 80%",
        once: true,
      },
    });

    const columns = refContent.current.children;

    // initial states
    gsap.set(refDot.current, {
      y: -300,
      xPercent: -50,
      yPercent: -50,
      left: "50%",
      top: "50%",
    });

    gsap.set(refWave.current, {
      scale: 0,
      opacity: 0,
      xPercent: -50,
      yPercent: -50,
      left: "50%",
      top: "50%",
    });

    gsap.set(columns, {
      opacity: 0,
      y: 40,
      filter: "blur(10px)",
    });

    tl.to(refDot.current, {
      y: 0,
      duration: 0.6,
      ease: "power3.in",
    })

      // impact
      .to(refDot.current, {
        scale: 2.5,
        opacity: 0,
        duration: 0.3,
      })

      // 🌊 centered wave
      .to(
        refWave.current,
        {
          scale: 10,
          opacity: 1,
          duration: 1.6,
          ease: "expo.out",
        },
        "-=0.2"
      )

      // content reveal
      .to(
        columns,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          stagger: {
            each: 0.12,
            from: "center",
          },
          ease: "power3.out",
        },
        "-=1.2"
      )

      // fade wave
      .to(refWave.current, {
        opacity: 0,
        duration: 0.8,
      });
  }, { scope: refFooter });

  return (
    <footer
      ref={refFooter}
      className="relative w-full bg-black text-white overflow-hidden"
    >
      {/* 🔥 COOL GRADIENT BACKGROUND */}
      <div className="absolute inset-0 
        bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_60%),
             radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_70%)]
      " />

      {/* subtle noise/glow */}
      <div className="absolute inset-0 opacity-[0.05]
        bg-[linear-gradient(to_right,#fff_1px,transparent_1px),
            linear-gradient(to_bottom,#fff_1px,transparent_1px)]
        bg-[size:50px_50px]" />

      {/* DOT (centered) */}
      <div
        ref={refDot}
        className="absolute z-40 w-3 h-3 rounded-full bg-white
        shadow-[0_0_30px_rgba(255,255,255,1)]"
      />

      {/* 🌊 WAVE (centered) */}
      <div
        ref={refWave}
        className="absolute z-20 w-60 h-60 rounded-full 
        bg-white/10 backdrop-blur-[80px]"
      />

      {/* CONTENT */}
      <div
        ref={refContent}
        className="relative z-30 max-w-7xl mx-auto px-8 py-28
        grid grid-cols-2 md:grid-cols-5 gap-12"
      >
        {/* LOGO */}
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-3xl font-semibold tracking-wide">
            Devlup Labs
          </h2>
          <p className="text-sm text-gray-400 mt-4">
            Building systems. Scaling ideas. Creating impact.
          </p>
        </div>

        {[
          ["Community", ["Events", "Hackathons", "Workshops"]],
          ["Resources", ["Projects", "Blogs", "Podcasts"]],
          ["Connect", ["GitHub", "LinkedIn", "Twitter"]],
          ["Support", ["Contact", "FAQ", "Help"]],
        ].map(([title, items], i) => (
          <div key={i}>
            <h4 className="text-sm font-medium mb-4 text-gray-300">
              {title}
            </h4>
            {items.map((item, j) => (
              <p
                key={j}
                className="text-sm text-gray-500 mb-2 hover:text-white transition cursor-pointer"
              >
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/10 text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Devlup Labs
      </div>
    </footer>
  );
};

export default Footer;