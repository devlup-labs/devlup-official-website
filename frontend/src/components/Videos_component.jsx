import { useState, useMemo, useEffect } from "react";
import TopControls from "./Video/TopControls.jsx";
import Cards from "./Video/Cards";
import { getVideos } from "../api/services.js";

export default function VideosComponent() {
  const [apiVideos, setApiVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    getVideos()
      .then((res) => {
        let data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const formatted = data.map((v) => ({ id: v.videoId || "", title: v.title || "Untitled Video", tag: (v.category || "general").toLowerCase(), description: v.description || "" }));
          setApiVideos(formatted);
        }
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  const videoData = apiVideos;

  const tags = useMemo(() => {
    if (!Array.isArray(videoData)) return [];
    const uniqueTags = new Set();
    videoData.forEach((v) => { const tag = (v.tag || "general").toLowerCase().trim(); if (tag) uniqueTags.add(tag); });
    const tagArray = Array.from(uniqueTags);
    const filtered = tagArray.filter((t) => t !== "general");
    return ["general", ...filtered];
  }, [videoData]);

  const filteredVideoData = useMemo(() => {
    const searchLower = (searchTerm || "").toLowerCase();
    return videoData.filter((video) => {
      const title = (video.title || "").toLowerCase();
      const tag = (video.tag || "").toLowerCase();
      const matchSearch = title.includes(searchLower);
      const matchTag = selectedTags.length === 0 || selectedTags.includes(tag);
      return matchSearch && matchTag;
    });
  }, [videoData, searchTerm, selectedTags]);

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const searchLower = searchTerm.toLowerCase();
    return videoData.filter((v) => (v.title || "").toLowerCase().includes(searchLower)).slice(0, 5);
  }, [searchTerm, videoData]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="fixed left-0 right-0 z-[1001] flex gap-3 items-center justify-center w-full pointer-events-none top-0 h-[88px]">
        <div className="pointer-events-auto relative">
          <TopControls searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedTags={selectedTags} setSelectedTags={setSelectedTags} tags={tags} />
          {searchTerm && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-black border border-white/10 rounded-xl shadow-xl overflow-hidden z-[9999]">
              {suggestions.map((s, i) => (
                <div key={s.id + i} onClick={() => setSearchTerm(s.title)} className="px-4 py-2 text-sm cursor-pointer transition bg-[var(--bg-muted)] text-white hover:bg-gray-200">{s.title}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {filteredVideoData.length > 0 ? <Cards videos={filteredVideoData} /> : <div className="flex-1 flex items-center justify-center text-[var(--text-primary)] text-xl p-6 text-center">No videos found matching your search or filter.</div>}
      </div>
    </div>
  );
}
