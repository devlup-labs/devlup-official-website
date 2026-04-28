import { useEffect, useRef, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { ThemeContext } from "../App";
import gsap from "gsap";


const EXPAND_HEIGHT = 120;
const GLOW_OFF = "0 0 0 rgba(0,0,0,0)";
const GLOW_PULSE = "0 0 45px rgba(34,211,238,0.9)";

export default function Portfolio() {
  const { username } = useParams();
  const [info, setInfo] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const cardsRef = useRef([]);
  const scanRef = useRef(null);
  const controlsRef = useRef(null);

  const navItems = [
    { name: "Blog", path: "/blog" },
    { name: "Team", path: "/team" },
    { name: "Podcasts", path: "/podcast" },
    { name: "Videos", path: "/video" },
    { name: "Timeline", path: "/timeline" },
  ];

const loadPortfolio = (inputCode) => {
  const code = inputCode.trim();
  if (!username) return;

  const url = code
    ? `http://localhost:8000/team/${username}/${code}` // with pass
    : `http://localhost:8000/team/${username}`;        // public only

  fetch(url)
    .then(res => res.json())
    .then(data => {

      let member, hidden;

      if (code) {
        // 🔥 hidden route response
        member = data.member;
        hidden = data.hidden;
      } else {
        // 🔥 public route response
        member = data.data;
        hidden = null;
      }

      if (!member) {
        console.error("Member not found");
        return;
      }

      const formatted = {
        name: member.member_name,
        rollNumber: member.member_roll_number,
        designation: member.member_designation,
        tag: member.member_tag,
        bio: member.member_about,
        profileImage: member.member_image,

        secretData: hidden
          ? {
              hiddenquote: hidden.member_hidden_quote,
              hiddencomments: hidden.member_hidden_comments?.join(", "),
              hiddencontribution: hidden.member_hidden_contributions?.[0]
                ? {
                    title:
                      hidden.member_hidden_contributions[0]
                        .contribution_title,
                    description:
                      hidden.member_hidden_contributions[0]
                        .contribution_description,
                  }
                : null,
            }
          : null,
      };

      setInfo(formatted);
      setReveal(!!hidden);
    })
    .catch(() => {
      gsap.to(controlsRef.current, {
        x: 12,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
      });
    });
};
  const handleReset = () => {
    setReveal(false);
    
    gsap.set(scanRef.current, { opacity: 0, top: "0%" });

    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.dataset.done = "false";

      const oldC = card.querySelector(".old-content");
      const newC = card.querySelector(".new-content");
      const wrapper = card.querySelector(".content-wrapper");

      gsap.set([oldC, newC, wrapper, card], { clearProps: "all" });
      if (card.dataset.index === "2") {
        gsap.set(card, { display: "none", height: 0, opacity: 0, marginTop: 0 });
      } else {
        gsap.set(newC, { opacity: 0, y: -20 });
      }
    });
  };

 useEffect(() => {
  if (username) loadPortfolio(""); // load only public first
}, [username]);

  useEffect(() => {
    if (reveal && info) {
      const scan = { y: 0 };

      gsap.to(scan, {
        y: 100,
        duration: 5.5,
        ease: "none",
        onUpdate: () => {
          const y = scan.y;
          const container = scanRef.current.parentElement;
          const totalHeight = container.scrollHeight;
          const currentYPos = (y / 100) * totalHeight;

          gsap.set(scanRef.current, {
            top: `${currentYPos}px`,
            opacity: 1,
          });

          cardsRef.current.forEach((card, index) => {
            if (!card || card.dataset.done === "true") return;

            // For the dynamic 4th box, we trigger when scan reaches the bottom of the 3rd box
            // For others, we trigger at their top.
            const triggerOffset = (card.dataset.index === "2") 
              ? cardsRef.current[1].offsetTop + cardsRef.current[1].offsetHeight 
              : card.offsetTop;
            
            if (currentYPos >= triggerOffset) {
              card.dataset.done = "true";
             

              const oldC = card.querySelector(".old-content");
              const newC = card.querySelector(".new-content");
              const wrapper = card.querySelector(".content-wrapper");

              if (card.dataset.index === "2") {
                // Dynamic expand for the 4th box
                gsap.set(card, { display: "block", height: 0 });
                gsap.to(card, {
                  height: "auto",
                  opacity: 1,
                  duration: 0.8,
                  ease: "power3.out",
                  onComplete: () => gsap.set(card, { height: "auto" })
                });
              } else {
                gsap.set(card, { opacity: 1 });
              }
              gsap.fromTo(
                card,
                { boxShadow: GLOW_OFF },
                { boxShadow: GLOW_PULSE, duration: 0.4, yoyo: true, repeat: 1 }
              );

              gsap.to(oldC, {
                opacity: 0,
                y: wrapper.scrollHeight,
                duration: 0.7,
                pointerEvents: "none",
              });

              gsap.fromTo(
                newC,
                { opacity: 0, y: 0 },
                { opacity: 1, y: -oldC.scrollHeight, duration: 0.7 }
              );
            }
          });
        },
      });
    }
  }, [reveal, info]);

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-[1000]
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        bg-transparent`}
      >
        <div className="flex items-center px-6 py-4">

          {/* LEFT */}
          <Link
            to="/"
            className="bg-[var(--bg-surface)]
            border border-[var(--border-subtle)]
            rounded-xl flex items-center gap-3 px-6 py-2 
            transition hover:scale-110 cursor-pointer"
          >
            <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-[var(--text-primary)] text-lg font-semibold">
              DevlUp Labs
            </h1>
          </Link>

          {/* RIGHT */}
          <div className="flex items-center ml-auto">

            {/* DESKTOP MENU */}
            <div
              className={`hidden md:flex items-center gap-1 px-3 py-2
              bg-[var(--bg-surface)]
              border border-[var(--border-subtle)]
              rounded-xl transition-transform duration-200
              ${!mobileMenuOpen ? "hover:scale-110" : ""}`}
            >
              <nav
                className={`flex items-center gap-6 overflow-hidden
                transition-all duration-300 ease-out 
                ${mobileMenuOpen ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"}`}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[var(--text-primary)] whitespace-nowrap hover:text-blue-500 transition"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* THEME TOGGLE */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg
                  bg-[var(--bg-surface)]
                  border border-[var(--border-subtle)]
                  flex items-center justify-center
                  hover:cursor-pointer"
                >
                  {isDarkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-[var(--text-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-[var(--text-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </button>
              </nav>

              {/* DESKTOP HAMBURGER */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex flex-col gap-1.5 px-2 py-1"
              >
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5 px-2 py-1 z-50"
            >
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`
          fixed top-[72px] left-0 right-0 bottom-0
          z-40 md:hidden
          bg-black/40 backdrop-blur-2xl
          flex flex-col items-center justify-center
          space-y-8 text-2xl font-semibold text-white
          transition-all duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          transform-gpu
          ${mobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            style={{ transitionDelay: `${index * 70}ms` }}
            className={`transition-all duration-500 transform-gpu
            ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            hover:text-blue-400`}
          >
            {item.name}
          </Link>
        ))}

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className={`mt-6 p-3 rounded-lg
          bg-[var(--bg-surface)]
          border border-[var(--border-subtle)]
          flex items-center justify-center
          transition-all duration-500 transform-gpu
          ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-[var(--text-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-[var(--text-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div 
        className="min-h-screen bg-[var(--bg-main-gradient)] text-[var(--text-primary)] p-4 sm:p-8 flex flex-col items-center relative"
        style={{ paddingTop: '100px' }}
      >

      {/* SCAN LINE */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 h-[2px] opacity-0 bg-white shadow-[0_0_20px_#22d3ee] z-[900]"
      />

      <div className="w-full max-w-6xl pt-6 md:pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
          {/* LEFT SIDE (Column 1 on Desktop) */}
          <div className="space-y-4 md:space-y-6">
            {/* 1. IMAGE */}
            <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
              <img
                src={info?.profileImage}
                className="w-full h-[280px] md:h-[400px] object-cover"
                alt="Profile"
              />
            </div>

            {/* 4. COMMENTS (Hidden before scan to avoid mobile gap) */}
            <div
              ref={(el) => (cardsRef.current[2] = el)}
              data-index="2"
              className="bg-[var(--bg-surface)] rounded-xl md:rounded-2xl p-4 md:p-5 border border-[var(--border-subtle)] overflow-hidden opacity-0 shadow-lg"
              style={{ display: "none" }}
            >
              <div className="content-wrapper">
                <div className="old-content text-[var(--text-muted)] text-xs md:text-sm uppercase tracking-wider">
                  Identification / Comments
                </div>
                <div className="reveal-slot min-h-[50px] md:min-h-[60px] flex items-center">
                  <div className="new-content opacity-0 text-sm md:text-base text-[var(--text-primary)]">
                    <span className="text-cyan-400 font-bold">@{info?.name}</span> <br />
                    <p className="mt-1 leading-relaxed italic">{info?.secretData?.hiddencomments}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (Columns 2-3 on Desktop) */}
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            {/* 2. HEADER */}
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              className="bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-[var(--border-subtle)] overflow-hidden shadow-lg"
            >
              <div className="content-wrapper">
                <div className="old-content space-y-1 text-[var(--text-primary)]">
                  <h1 className="text-xl md:text-2xl font-bold">{info?.name}</h1>
                  <p className="text-sm md:text-base opacity-70">{info?.rollNumber}</p>
                  <p className="text-sm md:text-base font-medium text-cyan-500">{info?.designation}</p>
                  <p className="text-xs md:text-sm text-[var(--text-muted)]">#{info?.tag}</p>
                </div>

                <div className="reveal-slot min-h-[60px] md:min-h-[80px] flex items-center">
                  <div className="new-content opacity-0 italic text-[var(--text-secondary)] text-base md:text-lg">
                    "{info?.secretData?.hiddenquote}"
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ABOUT */}
            <div
              ref={(el) => (cardsRef.current[1] = el)}
              className="bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-[var(--border-subtle)] overflow-hidden shadow-lg"
            >
              <div className="content-wrapper">
                <div className="old-content text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
                  {info?.bio}
                </div>

                <div className="reveal-slot min-h-[100px] md:min-h-[120px] flex items-center">
                  <div className="new-content opacity-0 text-sm md:text-base space-y-3">
                    <p className="font-bold text-[var(--text-primary)] border-l-4 border-cyan-500 pl-4 py-1">
                      {info?.secretData?.hiddencontribution?.title}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed">
                      {info?.secretData?.hiddencontribution?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div ref={controlsRef} className="mt-6 flex gap-4 opacity-0 focus-within:opacity-100 transition-opacity duration-300">

        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadPortfolio(searchKey)}
          placeholder=""
          className="px-6 py-3 rounded-full border border-red-500 bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] cursor-text"
        />

        
      </div>
      </div>
    </>
  );
}