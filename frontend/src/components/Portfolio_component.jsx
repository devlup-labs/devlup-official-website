import { useEffect, useRef, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../App";
import { Trash2 } from "lucide-react";
import gsap from "gsap";

const EXPAND_HEIGHT = 120;
const GLOW_OFF = "0 0 0 rgba(0,0,0,0)";
const GLOW_PULSE = "0 0 45px rgba(34,211,238,0.9)";

export default function PortfolioComponent() {
  const { username } = useParams();
  const [info, setInfo] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [newComment, setNewComment] = useState("");

  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const cardsRef = useRef([]);
  const scanRef = useRef(null);
  const controlsRef = useRef(null);
  const inputRef = useRef(null);
  const hasScannedRef = useRef(false);

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
      ? `http://localhost:8000/team/${username}/${code}`
      : `http://localhost:8000/team/${username}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let member, hidden;
        if (code) {
          member = data.member;
          hidden = data.hidden;
        } else {
          member = data.data;
          hidden = null;
        }

        if (!member || (code && !hidden)) {
          gsap.fromTo(
            inputRef.current,
            { x: 0 },
            { x: 12, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut" }
          );

          gsap.fromTo(
            inputRef.current,
            { boxShadow: "0 0 0px rgba(239,68,68,0)" },
            { boxShadow: "0 0 18px rgba(239,68,68,0.8)", duration: 0.25, yoyo: true, repeat: 1 }
          );

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
                hiddencomments: hidden.member_hidden_comments || [],
                hiddencontribution: hidden.member_hidden_contributions?.[0]
                  ? {
                      title: hidden.member_hidden_contributions[0].contribution_title,
                      description: hidden.member_hidden_contributions[0].contribution_description,
                    }
                  : null,
              }
            : null,
        };

        setInfo(formatted);
        setReveal(!!hidden);
      })
      .catch(() => {
        gsap.to(controlsRef.current, { x: 12, duration: 0.1, repeat: 5, yoyo: true });
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
    if (username) loadPortfolio("");
  }, [username]);

  useEffect(() => {
    if (reveal && info && !hasScannedRef.current) {
      hasScannedRef.current = true;
      const scan = { y: 0 };

      gsap.to(scan, {
        y: 100,
        duration: 5.5,
        ease: "none",
        onComplete: () => {
          inputRef.current?.blur();
          gsap.to(scanRef.current, { opacity: 0, duration: 0.5, onComplete: () => setScanComplete(true) });
        },
        onUpdate: () => {
          const y = scan.y;
          const container = scanRef.current.parentElement;
          const totalHeight = container.scrollHeight;
          const currentYPos = (y / 100) * totalHeight;

          gsap.set(scanRef.current, { top: `${currentYPos}px`, opacity: 1 });

          cardsRef.current.forEach((card, index) => {
            if (!card || card.dataset.done === "true") return;
            const triggerOffset =
              card.dataset.index === "2" ? cardsRef.current[1].offsetTop : card.offsetTop;
            if (currentYPos >= triggerOffset) {
              card.dataset.done = "true";
              const oldC = card.querySelector(".old-content");
              const newC = card.querySelector(".new-content");
              const wrapper = card.querySelector(".content-wrapper");

              if (card.dataset.index === "2") {
                gsap.set(card, { display: "block", height: 0 });
                gsap.to(card, { height: "auto", opacity: 1, duration: 0.8, ease: "power3.out", onComplete: () => gsap.set(card, { height: "auto" }) });
              } else {
                gsap.set(card, { opacity: 1 });
              }

              gsap.fromTo(card, { boxShadow: GLOW_OFF }, { boxShadow: GLOW_PULSE, duration: 0.4, yoyo: true, repeat: 1 });

              gsap.to(oldC, { opacity: 0, y: wrapper.scrollHeight, duration: 0.7, pointerEvents: "none" });

              gsap.fromTo(newC, { opacity: 0, y: 0 }, { opacity: 1, y: -oldC.scrollHeight, duration: 0.7 });
            }
          });
        },
      });
    }
  }, [reveal, info]);

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await fetch(`http://localhost:8000/team/comment/${username}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment: newComment }) });

      setInfo((prev) => ({
        ...prev,
        secretData: {
          ...prev.secretData,
          hiddencomments: [...(prev.secretData?.hiddencomments || []), newComment],
        },
      }));

      gsap.set(cardsRef.current[2]?.querySelector(".new-content"), { clearProps: "transform" });

      setNewComment("");

      gsap.fromTo(cardsRef.current[2], { boxShadow: "0 0 0 rgba(34,211,238,0)" }, { boxShadow: "0 0 35px rgba(34,211,238,0.8)", duration: 0.3, yoyo: true, repeat: 1 });
    } catch {
      gsap.fromTo(controlsRef.current, { x: 0 }, { x: 10, duration: 0.08, repeat: 4, yoyo: true });
    }
  };

  const deleteComment = async (index) => {
    try {
      await fetch(`http://localhost:8000/team/comment/${username}/${index}`, { method: "DELETE" });

      setInfo((prev) => ({
        ...prev,
        secretData: { ...prev.secretData, hiddencomments: prev.secretData.hiddencomments.filter((_, i) => i !== index) },
      }));

      gsap.fromTo(cardsRef.current[2], { boxShadow: "0 0 0 rgba(239,68,68,0)" }, { boxShadow: "0 0 35px rgba(239,68,68,0.8)", duration: 0.3, yoyo: true, repeat: 1 });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-transparent`}>
        <div className="flex items-center px-6 py-4">
          <div className="relative flex items-center gap-2">
            <Link to="/" className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center gap-3 px-6 py-2 transition hover:scale-110 cursor-pointer">
              <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-[var(--text-primary)] text-lg font-semibold">DevlUp Labs</h1>
            </Link>

            <button onClick={() => navigate(-1)} className="absolute left-0 top-[60px] md:top-[80px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-2 hover:scale-105 transition shadow-md z-40" aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              <span className="text-[var(--text-primary)] text-sm">Back</span>
            </button>
          </div>

          <div className="flex items-center ml-auto">
            <div className={`hidden md:flex items-center gap-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl transition-transform duration-200 ${!mobileMenuOpen ? "hover:scale-110" : ""}`}>
              <nav className={`flex items-center gap-6 overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"}`}>
                {navItems.map((item) => (<Link key={item.name} to={item.path} onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-primary)] whitespace-nowrap hover:text-blue-500 transition">{item.name}</Link>))}

                <button onClick={toggleTheme} className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center hover:cursor-pointer">
                  {isDarkMode ? (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>)}
                </button>
              </nav>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex flex-col gap-1.5 px-2 py-1">
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex flex-col gap-1.5 px-2 py-1 z-50">
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-6 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed top-[72px] left-0 right-0 bottom-0 z-40 md:hidden bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8 text-2xl font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        {navItems.map((item, index) => (<Link key={item.name} to={item.path} onClick={() => setMobileMenuOpen(false)} style={{ transitionDelay: `${index * 70}ms` }} className={`transition-all duration-500 transform-gpu ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} hover:text-blue-400`}>{item.name}</Link>))}

        <button onClick={toggleTheme} className={`mt-6 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center transition-all duration-500 transform-gpu ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {isDarkMode ? (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>)}
        </button>
      </div>

      <div className="min-h-screen bg-[var(--bg-main-gradient)] text-[var(--text-primary)] p-4 sm:p-8 flex flex-col items-center relative" style={{ paddingTop: '100px' }}>
        <div ref={scanRef} className="absolute left-0 right-0 h-[2px] opacity-0 bg-white shadow-[0_0_20px_#22d3ee] z-[900]" />

        <div className="w-full max-w-6xl pt-6 md:pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="space-y-4 md:space-y-6">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
                <img src={info?.profileImage} className="w-full h-[280px] md:h-[400px] object-cover" alt="Profile" />
              </div>

              {!scanComplete && (
                <div ref={controlsRef} className="mt-6 flex gap-4 opacity-0 focus-within:opacity-100 transition-opacity duration-300 w-full">
                  <input ref={inputRef} type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadPortfolio(searchKey)} placeholder="" className="w-full px-6 py-3 rounded-full border border-red-500 bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] cursor-text" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div ref={(el) => (cardsRef.current[0] = el)} className="bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-[var(--border-subtle)] overflow-hidden shadow-lg">
                <div className="content-wrapper">
                  <div className="old-content space-y-1 text-[var(--text-primary)]">
                    <h1 className="text-xl md:text-2xl font-bold">{info?.name}</h1>
                    <p className="text-sm md:text-base opacity-70">{info?.rollNumber}</p>
                    <p className="text-sm md:text-base font-medium text-cyan-500">{info?.designation}</p>
                    <p className="text-xs md:text-sm text-[var(--text-muted)]">#{info?.tag}</p>
                  </div>

                  <div className="reveal-slot min-h-[60px] md:min-h-[80px] flex items-center">
                    <div className="new-content opacity-0 italic text-[var(--text-secondary)] text-base md:text-lg">"{info?.secretData?.hiddenquote}"</div>
                  </div>
                </div>
              </div>

              <div ref={(el) => (cardsRef.current[1] = el)} className="bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-[var(--border-subtle)] overflow-hidden shadow-lg">
                <div className="content-wrapper">
                  <div className="old-content text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">{info?.bio}</div>

                  <div className="reveal-slot min-h-[100px] md:min-h-[120px] flex items-center">
                    <div className="new-content opacity-0 text-sm md:text-base space-y-3">
                      <p className="font-bold text-[var(--text-primary)] border-l-4 border-cyan-500 pl-4 py-1">{info?.secretData?.hiddencontribution?.title}</p>
                      <p className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed">{info?.secretData?.hiddencontribution?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={(el) => (cardsRef.current[2] = el)} data-index="2" className="mt-8 w-full bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-[var(--border-subtle)] overflow-hidden opacity-0 shadow-lg" style={{ display: "none" }}>
            <div className="content-wrapper">
              <div className="old-content text-[var(--text-muted)] text-sm uppercase tracking-wider">Hidden Comments</div>

              <div className="reveal-slot min-h-[120px] flex items-center">
                <div className="new-content opacity-0 w-full">
                  <div className="space-y-3">
                    {info?.secretData?.hiddencomments?.map((comment, index) => (
                      <div key={index} className="rounded-xl border border-cyan-500/20 bg-black/20 px-4 py-3 backdrop-blur-md flex items-start justify-between gap-4">
                        <p className="italic leading-relaxed flex-1 break-words">{comment}</p>
                        <button onClick={() => deleteComment(index)} className="shrink-0 text-red-400 hover:text-red-300 transition hover:scale-110 cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Leave anonymous comment..." className="flex-1 rounded-xl border border-cyan-500/20 bg-black/20 px-4 py-3 text-sm outline-none" />
                    <button onClick={submitComment} className="w-full sm:w-auto rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:scale-105">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
