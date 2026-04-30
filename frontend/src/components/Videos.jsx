import { useState, useMemo, useEffect } from "react";
import TopControls from "./Video/TopControls.jsx";
import Cards from "./Video/Cards";
import { getVideos } from "../api/services.js";

const hardcodedVideoData = [
  { id: "56xFUD8O9yI", title: "Devlups Introduction", tag: "General", description: "Learn about DevlUp Labs and our mission.", author: "DevlUp Team", date: "2024-01-01" },
  { id: "00Nphhrxb0o", title: "Web Basics", tag: "Web", description: "Getting started with HTML, CSS, and JS.", author: "Web Team", date: "2024-01-05" },
  { id: "-NIiXIRuZj0", title: "Blockchain Basics", tag: "Blockchain", description: "Introduction to decentralized technology.", author: "Blockchain Team", date: "2024-01-10" },
  { id: "314S3-0_I2I", title: "JS Fundamentals", tag: "JS", description: "Mastering the core concepts of JavaScript.", author: "DevlUp Team", date: "2024-01-15" },
  { id: "hlhy1QsZ4Bw", title: "Cloud Deployment", tag: "Cloud", description: "Deploying your apps to the cloud.", author: "Cloud Team", date: "2024-01-20" },
  { id: "U-isVE5n4TY", title: "Advanced React", tag: "React", description: "Hooks, Context, and performance optimization.", author: "Web Team", date: "2024-01-25" },
  { id: "WvQCFqRkaec", title: "Smart Contracts", tag: "Blockchain", description: "Writing contracts with Solidity.", author: "Blockchain Team", date: "2024-01-30" },
  { id: "ZdTQ-bCDU0w", title: "ThreeJS Tutorial", tag: "3D Web", description: "Building 3D experiences on the web.", author: "Creative Team", date: "2024-02-01" },
];

// Helper to extract YouTube ID
const getYoutubeId = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

export default function App() {
  const [apiVideos, setApiVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    getVideos()
      .then(res => {
        let data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(v => ({
            id: getYoutubeId(v.video_url),
            title: v.video_title,
            tag: v.video_tag,
            description: v.video_description,
            date: v.video_date,
            author: v.video_author
          }));
          setApiVideos(formatted);
        }
      })
      .catch(err => console.error("Error fetching videos:", err));
  }, []);

  const videoData = apiVideos.length > 0 ? apiVideos : hardcodedVideoData;
  const tags = ["General", "Web", "React", "3D Web", "Blockchain", "JS", "Cloud"];

  const filteredVideoData = useMemo(() => {
    return videoData.filter(video => {
      const matchSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTags.length === 0 || selectedTags.includes(video.tag);
      return matchSearch && matchTag;
    });
  }, [videoData, searchTerm, selectedTags]);

  const filteredVideoIds = filteredVideoData.map(v => v.id);
  const activeVideo = filteredVideoData[activeIndex] || filteredVideoData[0];

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* SEARCH AND FILTER CONTROLS - Aligned with Header */}
      <div
        className="fixed left-0 right-0 z-[1001] flex gap-3 items-center justify-center w-full pointer-events-none"
        style={{ top: "0", height: "88px", background: "transparent" }}
      >
        <div className="pointer-events-auto">
          <TopControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            tags={tags}
          />
        </div>
      </div>

      {!isMobile ? (
        /* DESKTOP VIEW - Keep original layout */
        <div className="flex-1 mt-20">
          {filteredVideoIds.length > 0 ? (
            <Cards videoIds={filteredVideoIds} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-primary)] text-xl p-6 text-center">
              No videos found matching your search or filter.
            </div>
          )}
        </div>
      ) : (
        /* MOBILE VIEW - Podcast-like layout */
        <div className="min-h-screen pt-24 pb-8 px-4 flex flex-col gap-6">
          {filteredVideoData.length > 0 ? (
            <>
              {/* Featured Video (Top) */}
              <div className="w-full flex flex-col gap-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=0&rel=0`}
                    title={activeVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-70 uppercase tracking-widest font-bold">
                  <span>{activeVideo.date}</span>
                  <span>{activeVideo.tag}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-black uppercase leading-tight">
                    {activeVideo.title}
                  </h1>
                  <p className="text-[10px] font-bold opacity-60 uppercase">{activeVideo.author}</p>
                </div>

                <p className="text-xs opacity-70 leading-relaxed line-clamp-4">
                  {activeVideo.description || "No description available for this video."}
                </p>
              </div>

              {/* Horizontal Thumbnail Strip (Bottom) */}
              <div className="w-full overflow-x-auto pb-4 no-scrollbar mt-auto">
                <div className="flex gap-4 min-w-max px-2">
                  {filteredVideoData.map((video, index) => (
                    <button
                      key={video.id + index}
                      onClick={() => setActiveIndex(index)}
                      className={`relative w-32 aspect-video shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        activeIndex === index 
                          ? "border-blue-500 scale-105 shadow-lg ring-4 ring-blue-500/20" 
                          : "border-white/10 opacity-60"
                      }`}
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
                        className="w-full h-full object-cover" 
                        alt={video.title} 
                      />
                      {activeIndex === index && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                           <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-1" />
                           </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-primary)] text-lg p-6 text-center italic opacity-60">
              No videos found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
