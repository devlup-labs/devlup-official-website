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
      gsap.set(newC, { opacity: 0, y: -20 });
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
            {reveal && (
              <div
                ref={(el) => (cardsRef.current[2] = el)}
                className="bg-[#121821] rounded-2xl p-5 border border-white/10 overflow-hidden"
              >
                <div className="content-wrapper">

                  <div className="old-content text-gray-400 text-sm">
                    Comments
                  </div>

                  <div className="reveal-slot min-h-[60px]">
                    <div className="new-content opacity-0 text-sm text-white">
                      @{info?.name} <br />
                      {info?.secretData?.hiddencomments}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="md:col-span-2 space-y-6">

            {/* HEADER */}
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              className="bg-[#121821] rounded-3xl p-6 border border-white/10 overflow-hidden"
            >
              <div className="content-wrapper">

                <div className="old-content space-y-1">
                  <h1 className="text-xl font-bold">{info?.name}</h1>
                  <p>{info?.rollNumber}</p>
                  <p>{info?.designation}</p>
                  <p>#{info?.tag}</p>
                </div>

                <div className="reveal-slot min-h-[80px]">
                  <div className="new-content opacity-0 italic text-gray-300">
                    "{info?.secretData?.hiddenquote}"
                  </div>
                </div>

              </div>
            </div>

            {/* ABOUT + CONTRIBUTION */}
            <div
              ref={(el) => (cardsRef.current[1] = el)}
              className="bg-[#121821] rounded-3xl p-6 border border-white/10 overflow-hidden"
            >
              <div className="content-wrapper">

                <div className="old-content text-gray-300 text-sm">
                  {info?.bio}
                </div>

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

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div ref={controlsRef} className="mt-10 flex gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300">

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