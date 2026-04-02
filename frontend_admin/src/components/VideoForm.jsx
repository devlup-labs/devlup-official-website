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
        placeholder="Video ID" className="input" required />

      <input value={formData.video_title}
        onChange={(e)=>setFormData({...formData, video_title:e.target.value})}
        placeholder="Title" className="input" required />

      <input value={formData.video_tags}
        onChange={(e)=>setFormData({...formData, video_tags:e.target.value})}
        placeholder="Tags (comma separated)" className="input" />

      <input value={formData.video_thumbnail}
        onChange={(e)=>setFormData({...formData, video_thumbnail:e.target.value})}
        placeholder="Thumbnail URL" className="input" required />

      <input type="date"
        value={formData.video_date}
        onChange={(e)=>setFormData({...formData, video_date:e.target.value})}
        className="input" required />

      <input value={formData.video_url}
        onChange={(e)=>setFormData({...formData, video_url:e.target.value})}
        placeholder="Video URL (optional)" className="input" />

      <button className="btn-primary">
        {isEdit ? "Update" : "Add"} Video</button>
      <button type="button" onClick={onCancel}>Cancel</button>
      
    </form>
  );
};

export default VideoForm;