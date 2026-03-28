import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PodcastForm = ({ token, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    podcast_id: '',
    podcast_title: '',
    podcast_subtitle: '',
    podcast_tags: '', 
    podcast_thumbnail: '',
    podcast_author: '',
    podcast_date: new Date().toISOString().split('T')[0],
    podcast_url: ''
  });

  const isEdit = !!initialData;

useEffect(() => {
  if (initialData) {
    setFormData({
      podcast_id: initialData.podcast_id || '',
      podcast_title: initialData.podcast_title || '',
      podcast_subtitle: initialData.podcast_subtitle || '',
      podcast_thumbnail: initialData.podcast_thumbnail || '',
      podcast_author: initialData.podcast_author || '',
      podcast_date: initialData.podcast_date || new Date().toISOString().split('T')[0],
      podcast_url: initialData.podcast_url || '',
      podcast_tags: Array.isArray(initialData.podcast_tags) 
        ? initialData.podcast_tags.join(', ') 
        : (initialData.podcast_tags || '')
    });
  }
}, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Transform tags from string "tech, ai" to array ["tech", "ai"]
    const payload = {
      ...formData,
      podcast_tags: formData.podcast_tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (isEdit) {
       await axios.put(`/api/podcasts/${formData.podcast_id}`, payload, config);
      } else {
        await axios.post('/api/podcasts', payload, config);
      }
      onSuccess(); 
    } catch (err) {
      console.error("Backend Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error saving podcast.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Podcast ID</label>
          <input 
            disabled={isEdit}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={formData.podcast_id}
            onChange={(e) => setFormData({...formData, podcast_id: e.target.value})}
            required
            placeholder="e.g. pod-01"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Author</label>
          <input 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_author}
            onChange={(e) => setFormData({...formData, podcast_author: e.target.value})}
            required
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
        <input 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_title}
          onChange={(e) => setFormData({...formData, podcast_title: e.target.value})}
          required 
          placeholder="The Future of AI"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtitle</label>
        <input 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_subtitle}
          onChange={(e) => setFormData({...formData, podcast_subtitle: e.target.value})}
          required 
          placeholder="A deep dive into neural networks"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
          <input 
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_date}
            onChange={(e) => setFormData({...formData, podcast_date: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</label>
          <input 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_tags}
            onChange={(e) => setFormData({...formData, podcast_tags: e.target.value})}
            placeholder="AI, Tech, Future"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thumbnail URL</label>
        <input 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_thumbnail}
          onChange={(e) => setFormData({...formData, podcast_thumbnail: e.target.value})}
          required
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Podcast URL (Optional)</label>
        <input 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_url}
          onChange={(e) => setFormData({...formData, podcast_url: e.target.value})}
          placeholder="Spotify/YouTube Link"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100">
          {isEdit ? "Update Podcast" : "Publish Podcast"}
        </button>
        <button type="button" onClick={onCancel} className="px-8 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-2xl font-bold text-slate-600 transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PodcastForm;