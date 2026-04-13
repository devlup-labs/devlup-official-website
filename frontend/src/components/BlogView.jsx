import { useParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState, useContext } from "react";
import { getBlog, getComments, postComment, deleteComment } from "../api/services.js";
import { MessageCircle, Send, Loader, Trash2 } from "lucide-react";
import { ThemeContext } from "../App";

export default function BlogView() {
  const { id } = useParams();
  const { isDarkMode } = useContext(ThemeContext);
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  useLayoutEffect(() => {
    // Disable smooth scroll behavior
    document.documentElement.style.scrollBehavior = "auto";
    
    // Set scroll to top before browser paints
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    getBlog(id)
      .then((res) => setBlog(res.data?.data || res.data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (blog?.blog_id) {
      getComments(blog.blog_id).then((res) =>
        setComments(res.data?.data || [])
      );
    }
  }, [blog]);

  /* ================= COMMENT ================= */
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);

    await postComment({
      blog_id: blog.blog_id,
      comment_text: commentText,
    });

    setCommentText("");

    const updated = await getComments(blog.blog_id);
    setComments(updated.data?.data || []);

    setSubmitting(false);
  };

  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.comment_id !== id));
  };

  const tags = Array.isArray(blog?.blog_tags)
    ? blog.blog_tags
    : blog?.blog_tags
      ? [blog.blog_tags]
      : [];

  if (loading) {
    return (
      <div 
        className="h-screen flex items-center justify-center transition-all duration-500"
        style={{
          backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          color: isDarkMode ? "white" : "black"
        }}
      >
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-500"
      style={{
        backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        color: isDarkMode ? "white" : "black"
      }}
    >

      {/* 🔷 HERO */}
      <div className="relative w-full h-[220px]">
        <img src={blog.blog_thumbnail} className="w-full h-full object-cover" />

      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            {blog.blog_title}
          </h1>
          <p className="text-sm opacity-80 mt-2">
            {blog.blog_subtitle}
          </p>
        </div>
      </div>

      {/* 🔻 MERGED CONTENT & COMMENTS */}
      <div className={`flex-1 flex flex-col w-full px-6 md:px-16 pt-8 pb-10 backdrop-blur-md ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {tags.map((tag, i) => (
            <span key={i} className="opacity-100">
              #{tag}
            </span>
          ))}
        </div>

        {/* META */}
        <p className="text-sm opacity-100 mb-6">
          {blog.blog_author} • {blog.blog_date}
        </p>

        {/* CONTENT */}
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {blog.blog_content}
        </p>

        {/* 💬 COMMENTS (NO BOXES NOW) */}
        <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
          <h2 className="text-lg mb-4 flex gap-2 items-center">
          <MessageCircle size={18} />
          Comments ({comments.length})
        </h2>

        {comments.map((c) => (
          <div key={c.comment_id} className={`mb-4 border-b pb-3 ${isDarkMode ? 'border-white/20' : 'border-black/20'}`}>
            <div className="flex justify-between text-xs opacity-50 mb-1">
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
              <button onClick={() => handleDeleteComment(c.comment_id)}>
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-sm">{c.comment_text}</p>
          </div>
        ))}

        {/* INPUT */}
        <form onSubmit={handleSubmitComment} className="mt-6 flex flex-col items-center">

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                handleSubmitComment(e);
              }
            }}
            rows={4}
            placeholder="Write comment..."
            className={`w-full p-3 bg-transparent border rounded-lg outline-none ${isDarkMode ? 'border-white/30 text-white placeholder:text-white/50' : 'border-black/30 text-black placeholder:text-black/50'}`}
          />

          <button
            type="submit"
            disabled={submitting}
            className={`mt-3 px-15 py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 w-fit transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:opacity-90 ${
              isDarkMode 
                ? 'bg-[var(--bg-surface)] border border-white/10 shadow-lg' 
                : 'bg-[var(--bg-blog_card)] shadow-md'
            }`}
          >
            {submitting ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Post Comment
          </button>

        </form>

      </div>
    </div>
    </div>
  );
}