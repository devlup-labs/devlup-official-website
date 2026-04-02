import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetch(`/data/${id}.json`)
      .then((res) => res.json())
      .then((data) => setBlog(data.blog));
  }, [id]);

  if (!blog) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-30 bg-[var(--bg-main-gradient)] text-white px-6 md:px-16 py-12">
      
      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* LEFT IMAGE */}
        <div className="md:col-span-1">
          <div className="h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <img
              src={blog.blog_thumbnail}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* TOP CARD */}
          <div className="bg-[var(--bg-muted)] rounded-2xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-2">
              {blog.blog_title}
            </h1>

            <p className="text-sm opacity-90 mb-3">
              {blog.blog_subtitle}
            </p>

            <div className="flex flex-wrap gap-2 text-xs opacity-80 mb-3">
              {blog.blog_tags.map((tag, i) => (
                <span key={i}>#{tag}</span>
              ))}
            </div>

            <p className="text-xs opacity-70">
              {blog.blog_author} • {blog.blog_date}
            </p>
          </div>

          {/* CONTENT CARD */}
          <div className="bg-[var(--bg-muted)] rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[220px]">
            <p className="text-sm opacity-90 leading-relaxed">
              This is a preview description of the blog. You can replace this with actual blog content later.
            </p>

            <a
              href={blog.blog_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 w-fit px-4 py-2 text-xs rounded-full border border-white/40 hover:bg-white/10 transition"
            >
              Read Full Blog →
            </a>
          </div>
        </div>

        {/* COMMENTS FULL WIDTH */}
        <div className="md:col-span-3">
          <div className="bg-[var(--bg-muted)] rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Comments
            </h2>
            <p className="text-sm opacity-80">
              No comments yet...
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}