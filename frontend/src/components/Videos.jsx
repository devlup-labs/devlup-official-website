import { useState, useMemo, useEffect } from "react";
import TopControls from "./Video/TopControls.jsx";
import Cards from "./Video/Cards";
import { getVideos } from "../api/services.js";

const hardcodedVideoData = [
  { id: "56xFUD8O9yI", title: "Devlups Introduction", tag: "General" },
  { id: "00Nphhrxb0o", title: "Web Basics", tag: "Web" },
  { id: "-NIiXIRuZj0", title: "Blockchain Basics", tag: "Blockchain" },
  { id: "314S3-0_I2I", title: "JS Fundamentals", tag: "JS" },
  { id: "hlhy1QsZ4Bw", title: "Cloud Deployment", tag: "Cloud" },
  { id: "U-isVE5n4TY", title: "Advanced React", tag: "React" },
  { id: "WvQCFqRkaec", title: "Smart Contracts", tag: "Blockchain" },
  { id: "ZdTQ-bCDU0w", title: "ThreeJS Tutorial", tag: "3D Web" },
];

export default function App() {
  const [apiVideos, setApiVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    getVideos()
      .then(res => {
        let data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          // Map backend keys correctly: videoId, title, category, etc.
          const formatted = data.map(v => ({
            id: v.videoId,
            title: v.title || "Untitled Video",
            tag: v.category || "General",
            description: v.description || ""
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
      // Safe check for title and tag to avoid crashes if they are undefined
      const title = video.title || "";
      const tag = video.tag || "";
      const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTags.length === 0 || selectedTags.includes(tag);
      return matchSearch && matchTag;
    });
  }, [videoData, searchTerm, selectedTags]);

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

      {/* RESTORED ANIMATION: Using Cards for both mobile and desktop as requested */}
      <div className="flex-1">
        {filteredVideoData.length > 0 ? (
          <Cards videos={filteredVideoData} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-primary)] text-xl p-6 text-center">
            No videos found matching your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
