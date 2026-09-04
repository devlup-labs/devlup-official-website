import React, { useState } from "react";
import api from "../../api/axios";
import { Trash2, RefreshCw } from "lucide-react";

const VideoManager = ({ items = [], deleteItem, onSync }) => {
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  //  Sync videos from backend
  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post("/videos/update");

      // Refresh data from parent
      if (onSync) await onSync();
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Failed to sync videos");
    } finally {
      setSyncing(false);
    }
  };

  //  Update category
  const updateCategory = async (videoId, category) => {
    try {
      await api.put(
        `/videos/category/${videoId}?category=${category}`
      );

      // Refresh UI
      if (onSync) await onSync();
    } catch (err) {
      console.error("Category update failed:", err);
      alert("Failed to update category");
    }
  };

  //  Normalize backend data
  const safeItems = items
    .map((v) => ({
      videoId: v.videoId || v.video_id || v.id,
      title: v.title || v.video_title,
      thumbnail: v.thumbnail || v.video_thumbnail,
      author: v.author || v.video_author,
      published: v.published || v.video_date,
      link: v.link || v.video_url,
      category: v.category || "",
    }))
    // Remove invalid/duplicate entries
    .filter((v) => v.videoId && v.title);

  //  Empty state
  if (!safeItems.length) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg font-semibold">No videos found</p>
        <p className="text-sm mt-2">Click "Sync" to fetch from YouTube</p>

        <button
          onClick={handleSync}
          className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} /> Sync Videos
        </button>
      </div>
    );
  }

  const filteredVideos =
  selectedCategory === "all"
    ? safeItems
    : safeItems.filter(
        (v) => v.category?.toLowerCase() === selectedCategory.toLowerCase()
      );

  return (
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h2 className="text-lg font-bold text-slate-800">
        YouTube Videos ({safeItems.length})
      </h2>

     <div className="flex items-center gap-3 flex-wrap">

        {/*  CATEGORY FILTER */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-slate-50"
        >
          <option value="all">All</option>

          {[...new Set(safeItems.map(v => v.category).filter(Boolean))].map(cat => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>

        {/*  Sync */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync"}
        </button>
      </div>

      {/*  Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.videoId} //  FIXED (no Math.random)
            className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />

          <div className="absolute top-2 left-2 z-10 flex gap-1">
  {/* Dropdown */}
<select
  value={video.category}
  onChange={(e) =>
    updateCategory(video.videoId, e.target.value.toLowerCase())
  }
  className="bg-white text-sm border rounded px-2 py-1 shadow z-10"
>
  <option value="">Select</option>

  {/* Default options */}
  <option value="web">Web</option>
  <option value="ai">AI</option>
  <option value="system">System</option>

  {/*  Inject custom category if not present */}
  {video.category &&
    !["web", "ai", "system", "other"].includes(video.category) && (
      <option value={video.category}>
        {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
      </option>
    )}
</select>

  {/* Custom input */}
  <input
    type="text"
    placeholder="+ Add"
    onKeyDown={(e) => {
      if (e.key === "Enter" && e.target.value.trim()) {
        updateCategory(
          video.videoId,
          e.target.value.trim().toLowerCase()
        );
        e.target.value = "";
      }
    }}
    className="bg-white text-sm border rounded px-2 py-1 shadow w-20"
  />
</div>

              {/* Watch overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                <button
                  onClick={() => window.open(video.link, "_blank")}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm"
                >
                  ▶ Watch
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 line-clamp-2">
                {video.title}
              </h3>

              <p className="text-sm text-slate-500">{video.author}</p>

              <p className="text-xs text-slate-400">
                {video.published
                  ? new Date(video.published).toLocaleDateString()
                  : "No date"}
              </p>

              {/* Delete */}
              <div className="flex justify-end mt-4">
                {deleteItem && (
                  <button
                    onClick={() => deleteItem(video.videoId)}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoManager;