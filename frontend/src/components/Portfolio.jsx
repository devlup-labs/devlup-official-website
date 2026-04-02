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

    fetch(`/data/${fileName}.json`)
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
        if (key === "a") {
          setTimeout(() => setReveal(true), 600);
        } else {
          setReveal(false);
        }
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

          gsap.set(scanRef.current, {
            top: `${y}%`,
            opacity: 1,
          });

          cardsRef.current.forEach((card) => {
            if (!card || card.dataset.done === "true") return;

            const slot = card.querySelector(".reveal-slot");
            const trigger =
              (slot.getBoundingClientRect().top / window.innerHeight) * 100;

            if (y >= trigger) {
              card.dataset.done = "true";

              const oldC = card.querySelector(".old-content");
              const newC = card.querySelector(".new-content");
              const wrapper = card.querySelector(".content-wrapper");

              gsap.fromTo(
                card,
                { boxShadow: GLOW_OFF },
                { boxShadow: GLOW_PULSE, duration: 0.4, yoyo: true, repeat: 1 }
              );

              gsap.to(wrapper, {
                height: wrapper.scrollHeight,
                duration: 0.7,
              });

              gsap.to(oldC, {
                marginTop: wrapper.scrollHeight,
                duration: 0.7,
              });

              gsap.fromTo(
                newC,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6 }
              );
            }
          });
        },
      });
    }
  }, [reveal, info]);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6 flex flex-col items-center">

      {/* SCAN LINE */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 h-[2px] opacity-0 bg-white shadow-[0_0_20px_#22d3ee]"
      />

      <div className="w-full max-w-6xl pt-10">

        <div className="grid md:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* IMAGE (NO ANIMATION) */}
            <div className="rounded-3xl overflow-hidden border border-white/10">
              <img
                src={info?.profileImage}
                className="w-full h-[300px] object-cover"
              />
            </div>

            {/* COMMENTS */}
            <div
              ref={(el) => (cardsRef.current[2] = el)}
              className="bg-[#121821] rounded-2xl p-5 border border-white/10 overflow-hidden"
            >
              <div className="content-wrapper">

                <div className="reveal-slot min-h-[60px]">
                  <div className="new-content opacity-0 text-sm text-white">
                    @{info?.name} <br />
                    {info?.secretData?.hiddencomments}
                  </div>
                </div>

                <div className="old-content text-gray-400 text-sm">
                  Comments
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="md:col-span-2 space-y-6">

            {/* HEADER */}
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              className="bg-[#121821] rounded-3xl p-6 border border-white/10 overflow-hidden"
            >
              <div className="content-wrapper">

                <div className="reveal-slot min-h-[80px]">
                  <div className="new-content opacity-0 italic text-gray-300">
                    "{info?.secretData?.hiddenquote}"
                  </div>
                </div>

                <div className="old-content space-y-1">
                  <h1 className="text-xl font-bold">{info?.name}</h1>
                  <p>{info?.rollNumber}</p>
                  <p>{info?.designation}</p>
                  <p>#{info?.tag}</p>
                </div>

              </div>
            </div>

            {/* ABOUT + CONTRIBUTION */}
            <div
              ref={(el) => (cardsRef.current[1] = el)}
              className="bg-[#121821] rounded-3xl p-6 border border-white/10 overflow-hidden"
            >
              <div className="content-wrapper">

                <div className="reveal-slot min-h-[120px]">
                  <div className="new-content opacity-0 text-sm space-y-2">
                    <p className="font-semibold">
                      {info?.secretData?.hiddencontribution?.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {info?.secretData?.hiddencontribution?.description}
                    </p>
                  </div>
                </div>

                <div className="old-content text-gray-300 text-sm">
                  {info?.bio}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div ref={controlsRef} className="mt-10 flex gap-4">

        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadPortfolio(searchKey)}
          placeholder="ENTER THE PASS"
          className="px-6 py-3 rounded-full border border-red-500 bg-transparent"
        />

        <button
          onClick={() => loadPortfolio(searchKey)}
          className="px-8 py-3 border border-white/20 rounded-xl"
        >
          EXECUTE SCAN
        </button>
      </div>
    </div>
  );
}