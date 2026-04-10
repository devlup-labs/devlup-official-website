import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoForm = ({ token, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    video_id: '',
    video_title: '',
    video_tags: '',
    video_thumbnail: '',
    video_date: new Date().toISOString().split('T')[0],
    video_url: ''
  });

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        video_id: initialData.video_id || '',
        video_title: initialData.video_title || '',
        video_thumbnail: initialData.video_thumbnail || '',
        video_date: initialData.video_date || '',
        video_url: initialData.video_url || '',
        video_tags: Array.isArray(initialData.video_tags)
          ? initialData.video_tags.join(', ')
          : ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      video_tags: formData.video_tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`/api/videos/${formData.video_id}`, payload, config);
      } else {
        await axios.post('/api/videos', payload, config);
      }

      onSuccess();
    } catch (err) {
      alert("Error saving video");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input disabled={isEdit} value={formData.video_id}
        onChange={(e)=>setFormData({...formData, video_id:e.target.value})}
        placeholder="Video ID" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />

      <input value={formData.video_title}
        onChange={(e)=>setFormData({...formData, video_title:e.target.value})}
        placeholder="Title" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />

      <input value={formData.video_tags}
        onChange={(e)=>setFormData({...formData, video_tags:e.target.value})}
        placeholder="Tags" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />

      <input value={formData.video_thumbnail}
        onChange={(e)=>setFormData({...formData, video_thumbnail:e.target.value})}
        placeholder="Thumbnail URL" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />

      <input type="date"
        value={formData.video_date}
        onChange={(e)=>setFormData({...formData, video_date:e.target.value})}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />

      <input value={formData.video_url}
        onChange={(e)=>setFormData({...formData, video_url:e.target.value})}
        placeholder="Video URL (optional)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />

      <div className="flex gap-3">
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold">
          {isEdit ? "Update" : "Add"} Video</button>
        <button type="button" onClick={onCancel} className="px-8 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-2xl font-bold text-slate-600">Cancel</button>
      </div>
    </form>
  );
};

export default VideoForm;
