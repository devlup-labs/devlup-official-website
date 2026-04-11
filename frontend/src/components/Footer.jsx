import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { postContact } from "../api/services"; // adjust path


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

gsap.registerPlugin(ScrollTrigger);


const Footer = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    query: "",
  });

  const refFooter = useRef(null);
  const refContent = useRef(null);
  const refWave = useRef(null);
  const refDot = useRef(null);

  useGSAP(() => {
    const footer = refFooter.current;
    const dot = refDot.current;

    const footerHeight = footer.offsetHeight;
    const dotSize = dot.offsetHeight;

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await postContact(formData);

      alert(res.data.message);

      setFormData({ name: "", email: "", query: "" });

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <footer
      ref={refFooter}
      className="relative w-full pt-4 pb-2 overflow-hidden"
      style={{ background: "var(--bg-main1)" }}
    >
      {/* DOT */}
      <div
        ref={refDot}
        className="absolute z-40 w-3 h-3 rounded-full bg-blue-400 left-1/2 -translate-x-1/2 shadow-[0_0_30px_rgba(96,165,250,1)]"
      />

      {/* GSAP WAVE */}
      <div
        ref={refWave}
        className="absolute z-10 w-40 h-40 rounded-full border border-blue-400 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* MAIN */}
      <div
        ref={refContent}
        className="relative z-20 max-w-7xl mx-auto px-0 grid md:grid-cols-3 gap-8 items-start"
      >
        {/* LEFT */}
        <div className="space-y-5">
          <div>
            <h2 className="text-4xl mt-1 md:text-5xl font-black text-white">
              DevlUp Labs
            </h2>

            <p className="mt-9 text-white max-w-md text-sm leading-relaxed">
              Building developers, shipping ideas, and creating an ecosystem
              where learning meets real-world impact. We empower individuals to
              turn concepts into scalable solutions and cultivate a community
              driven by curiosity, growth, and meaningful technological
              advancement.
            </p>
          </div>

          <div className="flex  space-x-4 text-white text-sm">
            <p>devlup.labs.official</p>
            <p>devluplabs@iitj.ac.in</p>
          </div>

          {/* <div className="flex gap-5 pt-2 px-29 text-2xl text-white">
            <a href="https://github.com/YOUR_GITHUB" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGithub} />
            </a>

            <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>

            <a href="https://instagram.com/YOUR_INSTAGRAM" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div> */}
        </div>

        {/* 🔥 MIDDLE COLUMN */}
        <div className="space-y-4 text-white px-3 mt-6 md:mt-0">
          <h3 className="text-3xl mt-3 font-semibold text-center">
            Useful Links
          </h3>

          {/* LINKS + SOCIALS SIDE BY SIDE */}
          <div className="flex justify-center gap-10 mt-8">

            {/* LINKS */}
            <div className="flex flex-col gap-3 px-5 text-lg">
              <Link to="/blog" className="flex items-center justify-center px-3 py-1 rounded-full hover:bg-white/10 transition">Blog</Link>
              <Link to="/podcast" className="flex items-center justify-center px-3 py-1 rounded-full hover:bg-white/10 transition">Podcast</Link>
              <Link to="/team" className="flex items-center justify-center px-3 py-1 rounded-full hover:bg-white/10 transition">Team</Link>
              <Link to="/video" className="flex items-center justify-center px-3 py-1 rounded-full hover:bg-white/10 transition">Videos</Link>
              <Link to="/timeline" className="flex items-center justify-center px-3 py-1 rounded-full hover:bg-white/10 transition">Timeline</Link>
            </div>

            {/* SOCIALS (VERTICAL, ALIGNED) */}
            <div className="flex flex-col gap-3 mt-7 px-10 text-2xl items-center justify-start pt-[2px]">
              <a href="https://github.com/devlup-labs" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} className="hover:scale-110 transition" />
              </a>

              <a href="https://www.linkedin.com/company/devlup-labs/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedin} className="hover:scale-110 transition" />
              </a>

              <a href="https://www.instagram.com/devluplabs" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} className="hover:scale-110 transition" />
              </a>
            </div>

          </div>
        </div>

        {/* RIGHT (UNCHANGED) */}
        <div className="space-y-6">
          <h3 className="text-3xl px-22 mt-3 font-semibold text-white">
            Get in Touch!
          </h3>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full bg-transparent border-b border-white py-1.5 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full bg-transparent border-b border-white py-1.5 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            <textarea
              rows="1"
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="Your message"
              className="w-full bg-transparent border-b border-white py-2 text-[var(--text-primary)] placeholder:text-white focus:outline-none focus:border-blue-400 transition resize-none"
            />

            <button
              type="submit"
              className="px-15 py-2 rounded-full border border-red-500 text-white font-semibold transition-all hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] active:scale-95 mx-auto block"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-6 border-t border-[var(--border-subtle)] pt-3 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} DevlUp Labs • Built by the DevlUp's Team
      </div>
    </footer>
  );
};

export default Footer;