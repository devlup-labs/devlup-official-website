import { useEffect, useRef, useMemo, useState, useContext, useLayoutEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import { getBlogs, getBlog, getComments, postComment, deleteComment } from "../api/services.js";
import { MessageCircle, Send, Loader, Trash2 } from "lucide-react";
import { CiSearch } from "react-icons/ci";
import { FaTags } from "react-icons/fa";
import { ThemeContext } from "../App";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export default function BlogComponent() {
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const smoothProgress = useRef(0);
  const tickingRef = useRef(false);
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { hamburgerOpen, setHamburgerOpen } = useContext(ThemeContext);

  const layers = useMemo(() => {
    let filteredBlogs = blogs.filter((card) => {
      const titleMatch = card.blog_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const authorMatch = card.blog_author?.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = titleMatch || authorMatch;

      let tags = card.blog_tags || [];
      if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(t => t);

      const tagMatch = selectedTags.length === 0 || tags.some(tag => selectedTags.includes(tag));

      return searchMatch && tagMatch;
    });

    return filteredBlogs.map((card, i) => {
      const angle = i * GOLDEN_ANGLE;
      const radius = 20 + Math.random() * 30;

      let tags = card.blog_tags || [];
      if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(t => t);

      return {
        id: i,
        blog_id: card.blog_id,
        title: card.blog_title,
        image: card.blog_thumbnail,
        author: card.blog_author,
        date: card.blog_date,
        tags: tags,
        instagram: "#",
        github: "#",
        linkedin: "#",
        rx: Math.cos(angle) * radius,
        ry: Math.sin(angle) * radius,
        baseScale: 0.2,
      };
    });
  }, [blogs, searchTerm, selectedTags]);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    blogs.forEach((blog) => {
      let tags = blog.blog_tags || [];
      if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(t => t);
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [blogs]);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (hamburgerOpen && (searchOpen || filterOpen)) {
      setSearchOpen(false);
      setFilterOpen(false);
    }
  }, [hamburgerOpen]);

  useEffect(() => {
    if ((searchOpen || filterOpen) && hamburgerOpen) setHamburgerOpen(false);
  }, [searchOpen, filterOpen]);

  const navigate = useNavigate();

  useEffect(() => {
    const viewportHeight = window.innerHeight;

    const updateCards = () => {
      const section = sectionRef.current;
      if (!section) {
        tickingRef.current = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      let progress = 0;

      if (rect.bottom < 0) progress = 1;
      else if (rect.top > viewportHeight) progress = 0;
      else progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);

      const diff = progress - smoothProgress.current;
      const easing = Math.abs(diff) > 0.2 ? 0.22 : 0.12;
      smoothProgress.current += diff * easing;

      const hasActive = activeCard !== null;
      const _isMobile = window.innerWidth < 768;
      const maxScale = _isMobile ? 1.2 : 1.8;
      const mobileFactorX = _isMobile ? 0.35 : 1;
      const mobileFactorY = _isMobile ? 0.55 : 1;

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const card = cardRefs.current[i];
        if (!card) continue;

        if (hasActive) {
          if (i === activeCard) {
            card.style.opacity = "1";
            card.style.pointerEvents = "auto";
          } else {
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
          }
          continue;
        }

        card.style.opacity = "1";

        const depth = i / layers.length;
        const windowSize = 0.18;
        const localProgress = (smoothProgress.current - depth) / windowSize;
        const clamped = Math.min(localProgress, 1);

        const scale = layer.baseScale + clamped * maxScale;

        let x = layer.rx * mobileFactorX * clamped;
        let y = layer.ry * mobileFactorY * clamped;

        if (localProgress > 1) {
          const exit = localProgress - 1;
          x += layer.rx * mobileFactorX * exit * 3;
          y += layer.ry * mobileFactorY * exit * 3;
        }

        let blur = 0;
        if (localProgress < 0.25) blur = Math.min(Math.round((0.25 - localProgress) * 6), 4);

        const clickable = blur < 1.5;

        const zIndex = (layers.length - i) * 1000 - Math.floor(localProgress * 10);

        const transformValue = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, 0) scale(${scale})`;

        if (card._t !== transformValue) {
          card.style.transform = transformValue;
          card._t = transformValue;
        }

        if (card._b !== blur) {
          card.style.filter = `blur(${blur}px)`;
          card._b = blur;
        }

        card.style.zIndex = zIndex;
        card.style.pointerEvents = clickable ? "auto" : "none";
      }

      if (Math.abs(diff) > 0.001) requestAnimationFrame(updateCards);
      else {
        smoothProgress.current = progress;
        tickingRef.current = false;
      }
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateCards);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    tickingRef.current = true;
    requestAnimationFrame(updateCards);

    return () => window.removeEventListener("scroll", onScroll);
  }, [layers, activeCard]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setActiveCard(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    getBlogs()
      .then((res) => {
        let blogData = res.data?.data;
        if (!blogData) blogData = res.data;
        if (!Array.isArray(blogData)) blogData = [];
        if (blogData.length > 0) setBlogs(blogData);
        else setBlogs([]);
      })
      .catch((err) => {
        console.error("ERROR FETCHING BLOGS:", err);
        setBlogs([]);
      });
  }, []);

  const sectionHeight = layers.length === 0 ? "100vh" : `${Math.max(400, layers.length * 200)}vh`;

  // SEARCH AND FILTER CONTROLS
  return (
    <>
      <div className="fixed left-0 right-0 z-[1001] flex gap-3 items-center justify-center w-full pointer-events-none top-0 h-[88px] bg-transparent">
        <div className="flex items-center relative pointer-events-auto" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <div className={`flex items-center bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-full transition-all duration-500 ease-out pointer-events-auto ${searchOpen ? (isMobile ? "w-[calc(100vw-80px)] h-10 px-4 justify-start" : "w-[300px] h-10 px-4 justify-start") : "w-10 h-10 justify-center"}`} onMouseDown={(e) => e.stopPropagation()}>
            <CiSearch className="text-white cursor-pointer shrink-0 pointer-events-auto" size={18} onClick={(e) => { e.stopPropagation(); const newState = !searchOpen; setSearchOpen(newState); if (newState && isMobile) setFilterOpen(false); }} />
            <input ref={searchInputRef} type="text" placeholder="Search blogs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onMouseDown={(e) => e.stopPropagation()} className={`${searchOpen ? "w-full ml-3 opacity-100" : "w-0 opacity-0"} bg-transparent border-none outline-none text-white text-sm transition-all duration-300 pointer-events-auto`} autoComplete="off" />
          </div>
        </div>

        <div className="pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          <div className={`flex items-center overflow-visible bg-[var(--bg-muted)] backdrop-blur-md border border-white/10 transition-all ease-in-out ${hamburgerOpen ? "duration-0" : "duration-500"} pointer-events-auto ${filterOpen ? "pr-3" : ""} rounded-full`} onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); const newState = !filterOpen; setFilterOpen(newState); if (newState && isMobile) setSearchOpen(false); }} className={`flex items-center justify-center text-white w-10 h-10 md:w-auto md:px-4 transition-all duration-300 cursor-pointer pointer-events-auto`}><FaTags size={16} /><span className={`ml-2 text-xs text-white font-medium hidden md:block transition-opacity duration-300 ${filterOpen ? "opacity-100" : "opacity-100"}`}>Filters</span></button>

            <div className={`flex items-center gap-2 transition-all ease-in-out ${hamburgerOpen ? "duration-0" : "duration-500"} pointer-events-auto ${filterOpen ? "max-w-[800px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"} overflow-hidden`}>
              {allTags.map((tag) => (
                <button key={tag} onClick={(e) => { e.stopPropagation(); if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag)); else setSelectedTags([...selectedTags, tag]); }} onMouseDown={(e) => e.stopPropagation()} className={`px-3 py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap transition-colors pointer-events-auto ${selectedTags.includes(tag) ? "bg-white/30 text-white font-semibold" : "text-white hover:text-white hover:bg-white/10"}`}>{tag}</button>
              ))}
              {selectedTags.length > 0 && (<button onClick={(e) => { e.stopPropagation(); setSelectedTags([]); }} onMouseDown={(e) => e.stopPropagation()} className="px-3 py-1 rounded-full text-[10px] md:text-xs transition-colors whitespace-nowrap pointer-events-auto text-red-300 hover:bg-white/10 hover:text-red-200 ml-2">Clear All</button>)}
            </div>
          </div>
        </div>
      </div>

      <section ref={sectionRef} style={{ height: sectionHeight }} className="relative bg-[var(--bg-main-gradient)] font-body">
        <div className="fixed top-0 left-0 right-0 bottom-0 h-screen w-screen overflow-hidden pointer-events-none z-0">
          {layers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/40">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-white tracking-wide"></p>
              </div>
            </div>
          )}

          {activeCard !== null && (<div onClick={() => setActiveCard(null)} className="absolute inset-0 bg-black/50 backdrop-blur-md z-[9000] pointer-events-auto" />)}

          {layers.map((layer, i) => (
            <div key={i} ref={(el) => (cardRefs.current[i] = el)} onClick={(e) => { e.stopPropagation(); setActiveCard(i); }} style={activeCard === i ? { transform: `translate(-50%, -50%) scale(${isMobile ? 1.3 : 2})`, zIndex: 9999, filter: "blur(0px)", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" } : {}} className="absolute left-1/2 top-1/2 w-56 h-72 rounded-2xl overflow-hidden bg-[var(--bg-blog_card)] text-white border border-white/10 shadow-xl cursor-pointer will-change-transform pointer-events-auto">
              {activeCard !== i ? (
                <div className="w-full h-full flex flex-col">
                  <div className="h-[25%] overflow-hidden"><img src={layer.image} className="w-full h-full object-cover" alt={layer.title} /></div>
                  <div className="h-[50%] flex flex-col items-center justify-center bg-[var(--bg-blog_card)] border-y border-white/10 px-3">
                    <p className="font-heading text-base font-bold text-center line-clamp-2 mb-2">{layer.title}</p>
                    <p className="text-xs opacity-70 text-center">{layer.author}</p>
                  </div>
                  <div className="h-[25%] overflow-hidden"><img src={layer.image} className="w-full h-full object-cover [transform:scaleY(-1)]" alt={layer.title} /></div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <div className="relative h-20"><img src={layer.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute right-2 top-2 text-[10px] font-bold uppercase">{layer.location}</div></div>
                  <div className="p-3 flex flex-col h-full">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-sm font-extrabold font-heading leading-tight">{layer.title}</h2>
                      <div className="flex gap-2 text-[10px] opacity-80">{layer.tags.map((t, idx) => (<span key={idx}>{t}</span>))}</div>
                      <p className="text-[10px] opacity-60">{layer.date}</p>
                      <div><p className="text-[10px] opacity-50 uppercase">Published by:</p><p className="text-xs font-semibold">{layer.author}</p></div>
                      <div className="flex gap-4 mt-2 text-sm opacity-80"><a href={layer.instagram} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faInstagram} /></a><a href={layer.github} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /></a><a href={layer.linkedin} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faLinkedin} /></a></div>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); navigate(`/blogs/${layer.blog_id}`); }} className="mt-auto w-full py-1.5 text-[11px] rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300">View</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function BlogView() {
  const { id } = useParams();
  const { isDarkMode } = useContext(ThemeContext);
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    getBlog(id).then((res) => setBlog(res.data?.data || res.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (blog?.blog_id) {
      getComments(blog.blog_id).then((res) => setComments(res.data?.data || []));
    }
  }, [blog]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    await postComment({ blog_id: blog.blog_id, comment_text: commentText });
    setCommentText("");
    const updated = await getComments(blog.blog_id);
    setComments(updated.data?.data || []);
    setSubmitting(false);
  };

  const handleDeleteComment = async (id) => { await deleteComment(id); setComments((prev) => prev.filter((c) => c.comment_id !== id)); };

  const tags = Array.isArray(blog?.blog_tags) ? blog.blog_tags : blog?.blog_tags ? [blog.blog_tags] : [];

  if (loading) return (
    <div className={`h-screen flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'text-white' : 'text-black'} bg-cover bg-fixed bg-center`} style={{ backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')" }}>Loading...</div>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${isDarkMode ? 'text-white' : 'text-black'} bg-cover bg-fixed bg-center`} style={{ backgroundImage: isDarkMode ? "url('/bgweb4.jpeg')" : "url('/bgweb3.jpeg')" }}>

      <div className="relative w-full h-[220px]">
        <img src={blog.blog_thumbnail} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`max-w-[92vw] rounded-2xl border px-6 py-4 md:px-8 md:py-5 shadow-2xl backdrop-blur-xl ${isDarkMode ? 'bg-black/45 border-white/10 text-white' : 'bg-white/70 border-white/60 text-slate-900'}`}>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{blog.blog_title}</h1>
            <p className="text-sm md:text-base opacity-90 mt-2">{blog.blog_subtitle}</p>
          </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col w-full px-6 md:px-16 pt-8 pb-10 backdrop-blur-md ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
        <div className="flex flex-wrap gap-2 text-sm mb-4">{tags.map((tag, i) => (<span key={i} className="opacity-100">#{tag}</span>))}</div>

        <p className="text-sm opacity-100 mb-6">{blog.blog_author} • {blog.blog_date}</p>

        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{blog.blog_content}</p>

        <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
          <h2 className="text-lg mb-4 flex gap-2 items-center"><MessageCircle size={18} />Comments ({comments.length})</h2>

          {comments.map((c) => (
            <div key={c.comment_id} className={`mb-4 border-b pb-3 ${isDarkMode ? 'border-white/20' : 'border-black/20'}`}>
              <div className="flex justify-between text-xs opacity-50 mb-1"><span>{new Date(c.created_at).toLocaleDateString()}</span><button onClick={() => handleDeleteComment(c.comment_id)}><Trash2 size={14} /></button></div>
              <p className="text-sm">{c.comment_text}</p>
            </div>
          ))}

          <form onSubmit={handleSubmitComment} className="mt-6 flex flex-col items-center">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); handleSubmitComment(e); } }} rows={4} placeholder="Write comment..." className={`w-full p-3 bg-transparent border rounded-lg outline-none ${isDarkMode ? 'border-white/30 text-white placeholder:text-white/50' : 'border-black/30 text-black placeholder:text-black/50'}`} />

            <button type="submit" disabled={submitting} className={`mt-3 px-15 py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 w-fit transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:opacity-90 ${isDarkMode ? 'bg-[var(--bg-surface)] border border-white/10 shadow-lg' : 'bg-[var(--bg-blog_card)] shadow-md'}`}>
              {submitting ? (<Loader size={18} className="animate-spin" />) : (<Send size={18} />)}
              Post Comment
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
