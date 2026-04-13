import { useParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { getBlog, getComments, postComment, deleteComment } from "../api/services.js";
import { MessageCircle, Send, Loader, Trash2 } from "lucide-react";

export default function BlogView() {
  const { id } = useParams();
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
      <div className="h-screen flex items-center justify-center text-white bg-[#0b0f14]">
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="bg-[#0b0f14] text-white min-h-screen flex flex-col">

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

      {/* 🔻 CONTENT (FULL FLAT SECTION) */}
      <div className="flex-1 w-full px-6 md:px-16 text-black bg-[var(--bg-card)] py-8">

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
        <p className="text-sm md:text-base leading-relaxed text-black whitespace-pre-wrap">
          {blog.blog_content}
        </p>

      </div>

      {/* 💬 COMMENTS (NO BOXES NOW) */}
      <div className="w-full px-6 md:px-16 bg-[var(--bg-card)] text-black pb-10">

        <h2 className="text-lg mb-4 flex gap-2 items-center">
          <MessageCircle size={18} />
          Comments ({comments.length})
        </h2>

        {comments.map((c) => (
          <div key={c.comment_id} className="mb-4 border-b border-black pb-3">
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
            rows={4}
            placeholder="Write comment..."
            className="w-full p-3 bg-transparent border border-black rounded-lg outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-15 py-3 bg-[var(--bg-main1)] text-white rounded-lg flex items-center justify-center gap-2 w-fit"
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
  );
}