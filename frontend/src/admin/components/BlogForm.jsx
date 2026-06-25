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
  blog_external_url: '',
  thumbnail: null,
  blog_media: null
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
        blog_external_url: initialData.blog_external_url || '',
        blog_tags: tagsString,
        blog_type: initialData.blog_type || 'internal',
        thumbnail: null,
        blog_media: null
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const payload = new FormData();

      payload.append("blog_title", formData.blog_title);
      payload.append("blog_subtitle", formData.blog_subtitle);
      payload.append("blog_author", formData.blog_author);
      payload.append("blog_date", formData.blog_date);
      payload.append("blog_type", formData.blog_type);

      payload.append("blog_tags", formData.blog_tags);

      if (formData.blog_content) {
        payload.append("blog_content", formData.blog_content);
      }

      if (formData.blog_external_url) {
        payload.append("blog_external_url", formData.blog_external_url);
      }

      if (formData.thumbnail) {
        payload.append("thumbnail", formData.thumbnail);
      }

      if (formData.blog_media) {
        payload.append("blog_media", formData.blog_media);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (isEdit) {
        await axios.put(`/blogs/${formData.blog_id}/`, payload, config);
      } else {
        await axios.post('/blogs/', payload, config);
      }

      onSuccess();

    } catch (err) {
      console.error("Full error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      console.error("Message:", err.message);

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error saving blog."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* ID + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {isEdit && (
  <input
    disabled
    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none disabled:opacity-50"
    value={formData.blog_id}
    placeholder="Blog ID"
  />
)}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thumbnail</label>

        <input
          type="file"
          accept="image/*"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          onChange={(e) =>
            setFormData({
              ...formData,
              thumbnail: e.target.files[0]
            })
          }
          required={!isEdit}
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
    

      {/* Blog Media */}
      {formData.blog_type === "internal" && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Blog Media (Optional)
          </label>

          <input
            type="file"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            onChange={(e) =>
              setFormData({
                ...formData,
                blog_media: e.target.files[0]
              })
            }
          />
        </div>
      )}

      {/* External URL */}
      {formData.blog_type === "external" && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            External Blog URL
          </label>

          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            value={formData.blog_external_url}
            onChange={(e) =>
              setFormData({
                ...formData,
                blog_external_url: e.target.value
              })
            }
            placeholder="https://..."
          />
        </div>
      )}

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