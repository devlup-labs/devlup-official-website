import { useState, useEffect, useMemo, useContext } from "react";
import { IoLogoYoutube } from "react-icons/io5";
import { getVideoIds } from "../../api/services";
import { ThemeContext } from "../../App";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 144;
const MAX_ATTEMPTS = 50;

const R1 = 75;
const R2 = 150;
const R3 = 220;
const R4 = 300;

const HOVER_MAIN = 2.4;
const HOVER_R1 = 1.65;
const HOVER_R2 = 1.4;
const HOVER_R3 = 1.25;
const HOVER_R4 = 1.08;

const START_OFFSET_Y = 88;
const BOTTOM_OFFSET = 44;
const SIDE_OFFSET = 32;

export default function Cards({ videos: propVideos }) {

  const { isDarkMode } = useContext(ThemeContext);

  const [internalVideoData, setInternalVideoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  useEffect(() => {

    if (propVideos && propVideos.length > 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchVideos = async () => {
      try {

        const res = await getVideoIds();

        if (!isMounted) return;

        const raw = res.data || [];

        const normalized = raw.map((v) => ({
          id: typeof v === "string" ? v : v.videoId,
          title: v.title ?? "",
          description: v.description ?? "",
        }));

        setInternalVideoData(normalized);

        setLoading(false);

      } catch (err) {
        setLoading(false);
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };

  }, [propVideos]);

  const displayVideos = useMemo(() => {

    if (propVideos && propVideos.length > 0) {
      return propVideos;
    }

    return internalVideoData;

  }, [propVideos, internalVideoData]);

  const cards = useMemo(() => {

    if (!displayVideos || displayVideos.length === 0) return [];

    const winWidth =
      typeof window !== "undefined"
        ? window.innerWidth
        : 1200;

    const winHeight =
      typeof window !== "undefined"
        ? window.innerHeight
        : 800;

    const w = Math.max(
      0,
      winWidth - CARD_WIDTH * 1.5 - SIDE_OFFSET * 2
    );

    const h = Math.max(
      0,
      winHeight -
      START_OFFSET_Y -
      CARD_HEIGHT * 1.5 -
      BOTTOM_OFFSET
    );

    const result = [];

    displayVideos.forEach((video, index) => {

      let attempts = 0;
      let placed = false;

      const vId = video.id || video.videoId;

      while (!placed && attempts < MAX_ATTEMPTS) {

        const x =
          SIDE_OFFSET +
          CARD_WIDTH / 2 +
          Math.random() * w;

        const y =
          START_OFFSET_Y +
          CARD_HEIGHT / 2 +
          Math.random() * h;

        if (
          result.every(
            (c) =>
              Math.hypot(c.x - x, c.y - y) > 160
          )
        ) {

          result.push({
            id: index,
            videoId: vId,
            thumbnail: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
            x,
            y,
            baseScale: 0.75 + Math.random() * 0.4,
          });

          placed = true;
        }

        attempts++;
      }

      if (!placed) {

        result.push({
          id: index,
          videoId: vId,
          thumbnail: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
          x:
            SIDE_OFFSET +
            CARD_WIDTH / 2 +
            Math.random() * w,
          y:
            START_OFFSET_Y +
            CARD_HEIGHT / 2 +
            Math.random() * h,
          baseScale: 1,
        });
      }
    });

    return result;

  }, [displayVideos]);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          backgroundImage: isDarkMode
            ? "url('/bgweb4.jpeg')"
            : "url('/bgweb3.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const active = cards.find((c) => c.id === activeId);

  return (
    <div
      className="w-full min-h-screen transition-all duration-500"
      style={{
        backgroundImage: isDarkMode
          ? "url('/bgweb4.jpeg')"
          : "url('/bgweb3.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >

      {/* MOBILE LAYOUT */}
      {isMobile ? (

        <div className="pt-[90px] px-3 pb-24 flex flex-col gap-5">

          {displayVideos.map((video, index) => {

            const vId = video.id || video.videoId;

            return (
              <div
                key={index}
                onClick={() => setSelectedId(index)}
                className="
                  w-full
                  rounded-2xl
                  overflow-hidden
                  bg-[var(--bg-surface)]
                  border border-[var(--border-subtle)]
                  shadow-xl
                  active:scale-[0.98]
                  transition-transform
                "
              >

                {/* THUMBNAIL */}
                <div className="relative w-full aspect-video">

                  <img
                    src={`https://img.youtube.com/vi/${vId}/hqdefault.jpg`}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                   <div className="absolute w-10 h-10 bg-white rounded-sm" />
                  <IoLogoYoutube className="relative text-[#FF0000] w-20 h-20 drop-shadow-xl" />
                  </div>
                </div>

                {/* INFO */}
                <div className="p-3">

                  <h2 className="text-white text-sm font-semibold line-clamp-2">
                    {video.title || "Untitled Video"}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {video.description || "No description"}
                  </p>

                </div>
              </div>
            );
          })}

          {/* MOBILE PLAYER */}
          {selectedId !== null && (

            <div
              className="
                fixed inset-0 z-[99999]
                bg-black
                flex items-center justify-center
                px-2
              "
              onClick={() => setSelectedId(null)}
            >

              <div className="w-full aspect-video rounded-xl overflow-hidden">

                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${
                    displayVideos[selectedId].id ||
                    displayVideos[selectedId].videoId
                  }?autoplay=1&modestbranding=1&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />

              </div>
            </div>
          )}
        </div>

      ) : (

        /* DESKTOP LAYOUT */
        <div className="relative w-full h-screen overflow-hidden">

          {selectedId !== null && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90000]"
              onClick={() => setSelectedId(null)}
            />
          )}

          {cards.map((card) => {

            const isSelected = card.id === selectedId;

            let scale = card.baseScale;
            let zIndex = 1;
            let opacity = 0.85;
            let blur = 0;

            if (selectedId === null && active) {

              const d = Math.hypot(
                card.x - active.x,
                card.y - active.y
              );

              if (card.id === activeId) {
                scale = HOVER_MAIN;
                zIndex = 6000;
                opacity = 1;
              }
              else if (d < R1) {
                scale = HOVER_R1;
                zIndex = 4000;
              }
              else if (d < R2) {
                scale = HOVER_R2;
                zIndex = 2500;
              }
              else if (d < R3) {
                scale = HOVER_R3;
              }
              else if (d < R4) {
                scale = HOVER_R4;
              }
              else {
                opacity = 0.4;
                blur = 1;
              }
            }

            return (
              <div
                key={card.id}
                onMouseEnter={() => setActiveId(card.id)}
                onMouseLeave={() => setActiveId(null)}
                onClick={() => setSelectedId(card.id)}
                style={{
                  left: `${card.x}px`,
                  top: `${card.y}px`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  width: `${CARD_WIDTH}px`,
                  height: `${CARD_HEIGHT}px`,
                  zIndex,
                  opacity,
                  filter: `blur(${blur}px)`,
                }}
                className="
                  absolute
                  transition-all duration-500
                  cursor-pointer
                  group
                "
              >

                <div className="
                  relative w-full h-full
                  rounded-[24px]
                  overflow-hidden
                  bg-[var(--bg-surface)]
                  border border-[var(--border-subtle)]
                  shadow-2xl
                ">

                  <img
                    src={card.thumbnail}
                    alt="thumbnail"
                    className="
                      w-full h-full object-cover
                      transition-transform duration-700
                      group-hover:scale-110
                    "
                  />

                  <div className="
                    absolute inset-0
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    bg-black/20
                  ">

        <div className="absolute w-10 h-10 bg-white rounded-sm" />
        <IoLogoYoutube className="relative text-[#FF0000] w-20 h-20 drop-shadow-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}