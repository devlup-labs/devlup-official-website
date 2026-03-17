import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";

const EXPAND_HEIGHT = 120;
const GLOW_OFF = "0 0 0 rgba(0,0,0,0)";
const GLOW_PULSE = "0 0 45px rgba(34,211,238,0.9)";

export default function Portfolio() {
  const { username } = useParams();
  const [info, setInfo] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [reveal, setReveal] = useState(false);
  
  const cardsRef = useRef([]);
  const scanRef = useRef(null);
  const controlsRef = useRef(null);

  const loadPortfolio = (inputKey) => {
    const key = inputKey.trim().toLowerCase();
    if (!key) return;

    const fileName = key === "a" ? "priyanshu" : key;
    const fetchPath = `/data/${fileName}.json`;

    fetch(fetchPath)
      .then((res) => {
        const isJson = res.headers.get('content-type')?.includes('application/json');
        if (!res.ok || !isJson) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setInfo(data);
        // Trigger reveal only for secret key 'a'
        if (key === "a") {
          setTimeout(() => setReveal(true), 600);
        } else {
          setReveal(false);
        }
      })
      .catch(() => {
        // SHAKE ON ERROR (Keeps current profile visible)
        gsap.to(controlsRef.current, {
          x: 12,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: "power1.inOut",
          onComplete: () => gsap.set(controlsRef.current, { x: 0 })
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
      gsap.set(newC, { opacity: 0, y: -20 });
    });
  };

  useEffect(() => {
    if (username) loadPortfolio(username);
  }, [username]);

  useEffect(() => {
    if (reveal && info) {
      const scan = { y: 0 };
      gsap.to(scan, {
        y: 100,
        duration: 4.5,
        ease: "power2.inOut",
        onUpdate: () => {
          const y = scan.y;
          gsap.set(scanRef.current, { top: `${y}%`, opacity: 1 });
          document.documentElement.style.setProperty("--scan-y", `${y}%`);

          cardsRef.current.forEach((card) => {
            if (!card || card.dataset.done === "true") return;
            const slot = card.querySelector(".reveal-slot");
            const triggerPoint = (slot.getBoundingClientRect().top / window.innerHeight) * 100;

            if (y >= triggerPoint) {
              card.dataset.done = "true";
              const oldC = card.querySelector(".old-content");
              const newC = card.querySelector(".new-content");
              const wrapper = card.querySelector(".content-wrapper");

              gsap.fromTo(card, { boxShadow: GLOW_OFF }, { 
                boxShadow: GLOW_PULSE, duration: 0.4, yoyo: true, repeat: 1 
              });
              gsap.to(wrapper, { height: `+=${EXPAND_HEIGHT}`, duration: 0.7, ease: "power2.out" });
              gsap.to(oldC, { marginTop: EXPAND_HEIGHT, duration: 0.7, ease: "power3.out" });
              gsap.fromTo(newC, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
            }
          });
        }
      });
    }
  }, [reveal, info]);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6 overflow-hidden relative flex flex-col items-center font-sans">
      
      <div ref={scanRef} className="absolute left-0 right-0 h-[2px] z-50 pointer-events-none opacity-0 bg-white shadow-[0_0_20px_#22d3ee,0_0_40px_#22d3ee]" />

      <div className="flex-grow w-full max-w-6xl mx-auto pt-10">
        {/* Profile always stays rendered to prevent page "jumps" */}
        <div className={`grid md:grid-cols-3 gap-8 relative z-10 transition-opacity duration-500 ${info ? 'opacity-100' : 'opacity-0'}`}>
          {/* Profile Card */}
          <div ref={(el) => (cardsRef.current[0] = el)} className="bg-[#121821] rounded-3xl p-8 overflow-hidden border border-white/5 shadow-2xl">
            <div className="content-wrapper">
              <div className="relative reveal-slot h-[100px]">
                <div className="new-content opacity-0 text-cyan-400 font-mono text-xs space-y-1">
                  <p className="text-gray-500 underline mb-1">DECRYPTED</p>
                  <p>ID: {info?.secretData?.codename || "UNKNOWN"}</p>
                  <p className="text-white pt-2">📍 {info?.location || "N/A"}</p>
                </div>
              </div>
              <div className="old-content flex flex-col items-center">
                <img src={info?.profileImage || "https://via.placeholder.com/150"} className="w-32 h-32 rounded-full border-4 border-white/10" alt="" />
                <h2 className="mt-4 text-2xl font-bold">{info?.name || "Loading..."}</h2>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="md:col-span-2 space-y-6">
            <div ref={(el) => (cardsRef.current[1] = el)} className="bg-[#121821] rounded-3xl p-8 overflow-hidden border border-white/5">
              <div className="content-wrapper">
                <div className="relative reveal-slot h-[80px]">
                  <div className="new-content opacity-0">
                    <h3 className="text-cyan-400 font-mono text-[10px] uppercase mb-2">ACCESS GRANTED</h3>
                    <div className="flex flex-wrap gap-2">
                      {info?.softwareSkills?.map(s => (
                        <span key={s} className="border border-cyan-500/30 px-2 py-1 rounded text-[9px] bg-cyan-500/5 text-cyan-200">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="old-content">
                  <h1 className="text-xl font-bold mb-3">Objective Summary</h1>
                  <p className="text-gray-400 text-sm leading-relaxed">{info?.bio}</p>
                </div>
              </div>
            </div>

            <div ref={(el) => (cardsRef.current[2] = el)} className="bg-[#121821] rounded-3xl p-8 overflow-hidden border border-white/5">
              <div className="content-wrapper">
                <div className="relative reveal-slot h-[80px]">
                  <div className="new-content opacity-0">
                    <p className="text-gray-300 text-xs italic">"{info?.secretData?.hiddenNote}"</p>
                  </div>
                </div>
                <div className="old-content">
                  <h2 className="text-lg font-bold mb-4">Academic Background</h2>
                  {info?.education?.map((e, i) => (
                    <p key={i} className="text-sm text-gray-500 mb-1">{e.level} - {e.place}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  PERSISTENT SEARCH CONTROLS */}
      <div ref={controlsRef} className="pb-20 flex gap-4 relative z-[110] mt-5">
        <input 
          type="text" 
          placeholder="Enter Access Key..." 
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPortfolio(searchKey)}
          className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-cyan-400 text-sm w-64"
        />
        <button 
          onClick={() => loadPortfolio(searchKey)} 
          className="px-8 py-3 bg-cyan-500 text-black font-black rounded-xl hover:bg-cyan-400 transition-all uppercase text-xs active:scale-95"
        >
          Execute Scan
        </button>
        <button 
          onClick={handleReset} 
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );
}