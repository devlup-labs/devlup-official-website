import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogForm = ({ token, initialData, onSuccess, onCancel }) => {
 const [formData, setFormData] = useState({
  blog_id: '',
  blog_title: '',
  blog_subtitle: '',
  blog_tags: [],
  blog_thumbnail: '',
  blog_author: '',
  blog_date: new Date().toISOString().split('T')[0],
  blog_type:'internal',
  blog_content: '',
  blog_url: ''
});

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      let tagsString = '';
      if (initialData.blog_tags) {
        if (Array.isArray(initialData.blog_tags)) {
          tagsString = initialData.blog_tags
            .map(tag => typeof tag === 'string' ? tag : '')
            .filter(tag => tag !== '')
            .join(', ');
        } else if (typeof initialData.blog_tags === 'string') {
          tagsString = initialData.blog_tags;
        }
      }

      setFormData({
        blog_id: initialData.blog_id || '',
        blog_title: initialData.blog_title || '',
        blog_subtitle: initialData.blog_subtitle || '',
        blog_thumbnail: initialData.blog_thumbnail || '',
        blog_author: initialData.blog_author || '',
        blog_date: initialData.blog_date || new Date().toISOString().split('T')[0],
        blog_content: initialData.blog_content || '',
        blog_url: initialData.blog_url || '',
        blog_tags: tagsString,
        blog_type: initialData.blog_type || 'internal'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      blog_tags: formData.blog_tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== "")
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (isEdit) {
        await axios.put(`/api/blogs/${formData.blog_id}/`, payload, config);
      } else {
        await axios.post('/api/blogs/', payload, config);
      }

      onSuccess();
    } catch (err) {
      console.error("Full error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      console.error("Message:", err.message);
      alert(`Error: ${err.response?.data?.detail || err.response?.data?.message || err.message || "Error saving blog."}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* ID + Author */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blog ID</label>
          <input
            disabled={isEdit}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none disabled:opacity-50"
            value={formData.blog_id}
            onChange={(e) => setFormData({ ...formData, blog_id: e.target.value })}
            required
            placeholder="e.g. blog-01"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Author</label>
          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            value={formData.blog_author}
            onChange={(e) => setFormData({ ...formData, blog_author: e.target.value })}
            required
            placeholder="John Doe"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_title}
          onChange={(e) => setFormData({ ...formData, blog_title: e.target.value })}
          required
          placeholder="Understanding AI"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtitle</label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_subtitle}
          onChange={(e) => setFormData({ ...formData, blog_subtitle: e.target.value })}
          required
          placeholder="Beginner friendly guide"
        />
      </div>

      {/* Date + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
          <input
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            value={formData.blog_date}
            onChange={(e) => setFormData({ ...formData, blog_date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            value={formData.blog_type}
            onChange={(e) => setFormData({ ...formData, blog_type: e.target.value })}
            required
          >
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_tags}
          onChange={(e) => setFormData({ ...formData, blog_tags: e.target.value })}
          placeholder="AI, Tech, etc."
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thumbnail URL</label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_thumbnail}
          onChange={(e) => setFormData({ ...formData, blog_thumbnail: e.target.value })}
          required
          placeholder="https://..."
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content</label>
        <textarea
          rows={5}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_content}
          onChange={(e) => setFormData({ ...formData, blog_content: e.target.value })}
          required
          placeholder="Write your blog content here..."
        />
      </div>

      {/* URL */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blog URL (Optional)</label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          value={formData.blog_url}
          onChange={(e) => setFormData({ ...formData, blog_url: e.target.value })}
          placeholder="External link (optional)"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold"
        >
          {isEdit ? "Update Blog" : "Publish Blog"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-8 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-2xl font-bold text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BlogForm;
