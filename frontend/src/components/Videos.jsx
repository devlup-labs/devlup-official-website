import { useState, useMemo } from "react";
import TopControls from "./Video/TopControls.jsx";
import Cards from "./Video/Cards";

const videoData = [
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ["General", "Web", "React", "3D Web", "Blockchain", "JS", "Cloud"];

  const filteredVideoData = useMemo(() => {
    return videoData.filter(video => {
      const matchSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTags.length === 0 || selectedTags.includes(video.tag);
      return matchSearch && matchTag;
    });
  }, [searchTerm, selectedTags]);

  const filteredVideoIds = filteredVideoData.map(v => v.id);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <TopControls 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        tags={tags}
      />
      {filteredVideoIds.length > 0 ? (
        <Cards videoIds={filteredVideoIds} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-white text-xl">
          No videos found match your search or filter.
        </div>
      )}
    </div>
  );
}


