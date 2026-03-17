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
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: refFooter.current,
        start: "top 80%",
        end: "bottom 60%",
        once: true,
      },
    });

    const columns = refContent.current.children;

    // Initial states
    gsap.set(refDot.current, { y: -500, opacity: 1, scale: 1 });
    gsap.set(refWave.current, { scale: 0, opacity: 0 });
    gsap.set(columns, { opacity: 0, y: 40, filter: "blur(10px)" });

    // Animation (UNCHANGED CORE)
    tl.to(refDot.current, {
      y: 0,
      duration: 0.7,
      ease: "power3.in",
    })
      .to(refDot.current, {
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
      className="relative w-full pt-28 pb-10 overflow-hidden"
      style={{ background: "var(--bg-main-gradient)" }}
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

      {/* MAIN CONTENT */}
      <div
        ref={refContent}
        className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-start"
      >
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
              DevlUp Labs
            </h2>
            <br />
            <br />
            <p className="mt-2 text-[var(--text-secondary)] max-w-sm text-sm leading-relaxed">
              Building developers, shipping ideas, and creating an ecosystem
              where learning meets real-world impact.
            </p>
          </div>

          <div className="space-y-2 text-[var(--text-secondary)] text-sm">
            <p>🌐 devlup_labs.official</p>
            <p>📧 devluplabs@gmail.com</p>
          </div>

          <div className="flex gap-5 pt-2 text-lg text-[var(--text-primary)]">
            <FontAwesomeIcon icon={faGithub} className="hover:text-blue-400 transition cursor-pointer" />
            <FontAwesomeIcon icon={faLinkedin} className="hover:text-blue-400 transition cursor-pointer" />
            <FontAwesomeIcon icon={faInstagram} className="hover:text-blue-400 transition cursor-pointer" />
            <FontAwesomeIcon icon={faEnvelope} className="hover:text-blue-400 transition cursor-pointer" />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
            Get in Touch!
          </h3>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)]/60 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)]/60 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)]/60 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "var(--gradient-primary)" }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="mt-16 border-t border-[var(--border-subtle)] pt-6 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} DevlUp Labs • Built with 💻 + ☕
      </div>
    </footer>
  );
};

export default Footer;