import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const refFooter = useRef(null);
  const refContent = useRef(null);
  const refWave = useRef(null);
  const refDot = useRef(null);

  useGSAP(() => {
    const footer = refFooter.current;
    const dot = refDot.current;

    const footerHeight = footer.offsetHeight;
    const dotSize = dot.offsetHeight;

    // 🎯 exact center of footer
    const centerY = footerHeight / 2 - dotSize / 2;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 80%",
        end: "bottom 60%",
        once: true,
      },
    });

    const columns = refContent.current.children;

    gsap.set(dot, { y: -500, opacity: 1, scale: 1 });
    gsap.set(refWave.current, { scale: 0, opacity: 0 });
    gsap.set(columns, { opacity: 0, y: 40, filter: "blur(10px)" });

    tl.to(dot, {
      y: centerY,
      duration: 0.7,
      ease: "power3.in",
    })
      .to(dot, {
        scale: 2.5,
        opacity: 0,
        duration: 0.3,
      })
      .to(
        refWave.current,
        {
          opacity: 1,
          scale: 12,
          duration: 1.6,
          ease: "expo.out",
        },
        "-=0.2"
      )
      .to(
        columns,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
        },
        "-=1.3"
      )
      .to(
        refWave.current,
        {
          opacity: 0,
          duration: 0.6,
        },
        "-=0.3"
      );
  }, { scope: refFooter });

  return (
    <footer
      ref={refFooter}
      className="relative w-full pt-6 pb-3 overflow-hidden"
      style={{ background: "var(--bg-main1)" }}
    >
      {/* DOT */}
      <div
        ref={refDot}
        className="absolute z-40 w-3 h-3 rounded-full bg-blue-400 left-1/2 -translate-x-1/2 shadow-[0_0_30px_rgba(96,165,250,1)]"
      />

      {/* WAVE */}
      <div
        ref={refWave}
        className="absolute z-10 w-40 h-40 rounded-full border border-blue-400 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* MAIN */}
      <div
        ref={refContent}
        className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-start"
      >
        {/* LEFT */}
        <div className="space-y-6">
          <div>
            <h2 className="text-5xl font-black text-white">
              DevlUp Labs
            </h2>

            <p className="mt-3 text-white max-w-md text-sm leading-relaxed">
              Building developers, shipping ideas, and creating an ecosystem
              where learning meets real-world impact
            </p>
          </div>

          <div className="space-y-1 text-white text-sm">
            <p>devlup.labs.official</p>
            <p>devluplabs@gmail.com</p>
          </div>

          <div className="flex gap-5 pt-2 text-lg text-white">
            <FontAwesomeIcon icon={faGithub} className="hover:text-[var(--text-primary)] transition cursor-pointer" />
            <FontAwesomeIcon icon={faLinkedin} className="hover:text-[var(--text-primary)] transition cursor-pointer" />
            <FontAwesomeIcon icon={faInstagram} className="hover:text-[var(--text-primary)] transition cursor-pointer" />
            <FontAwesomeIcon icon={faEnvelope} className="hover:text-[var(--text-primary)] transition cursor-pointer" />
          </div>
        </div>

        {/* RIGHT (UNCHANGED LAYOUT) */}
        <div className="space-y-4">
          <h3 className="text-3xl font-semibold text-white">
            Get in Touch!
          </h3>

          <form className="space-y-5">

            {/* NAME + EMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-transparent border-b border-white py-2 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border-b border-white py-2 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* MESSAGE */}
            <textarea
              rows="2"
              placeholder="Your message"
              className="w-full bg-transparent border-b border-white py-2 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition resize-none"
            />

            {/* BUTTON (fixed width, not stretched) */}
            <button
              type="submit"
              className="px-25 py-2.5 rounded-full border border-red-500 text-white font-semibold transition-all hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] active:scale-95 mx-auto block"
            >
              Submit
            </button>

          </form>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-10 border-t border-[var(--border-subtle)] pt-4 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} DevlUp Labs • Built with 💻 + ☕
      </div>
    </footer>
  );
};

export default Footer;