import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TimelineForm = ({ token, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    event_id: '',
    event_title: '',
    event_subtitle: '',
    event_description: '',
    event_date: '',
    event_photos: ['']
  });

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        event_id: initialData.event_id || '',
        event_title: initialData.event_title || '',
        event_subtitle: initialData.event_subtitle || '',
        event_description: initialData.event_description || '',
        event_date: initialData.event_date || '',
        event_photos: initialData.event_photos || ['']
      });
    }
  }, [initialData]);

  // ➕ Add photo field
  const addPhoto = () => {
    setFormData({
      ...formData,
      event_photos: [...formData.event_photos, '']
    });
  };

  //  Update photo
  const updatePhoto = (index, value) => {
    const updated = [...formData.event_photos];
    updated[index] = value;
    setFormData({ ...formData, event_photos: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      event_photos: formData.event_photos.filter(p => p !== '')
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`/api/timeline/${formData.event_id}`, payload, config);
      } else {
        await axios.post('/api/timeline', payload, config);
      }

      onSuccess();
    } catch {
      alert("Error saving event");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input disabled={isEdit} value={formData.event_id}
        onChange={(e)=>setFormData({...formData, event_id:e.target.value})}
        placeholder="Event ID" className="input" required />

      <input value={formData.event_title}
        onChange={(e)=>setFormData({...formData, event_title:e.target.value})}
        placeholder="Title" className="input" required />

      <input value={formData.event_subtitle}
        onChange={(e)=>setFormData({...formData, event_subtitle:e.target.value})}
        placeholder="Subtitle" className="input" required />

      <textarea value={formData.event_description}
        onChange={(e)=>setFormData({...formData, event_description:e.target.value})}
        placeholder="Description" className="input" required />

      <input type="date"
        value={formData.event_date}
        onChange={(e)=>setFormData({...formData, event_date:e.target.value})}
        className="input" required />

      {/* Photos */}
      <div>
        <p className="font-semibold">Photos</p>
        {formData.event_photos.map((photo, i) => (
          <input key={i}
            value={photo}
            onChange={(e)=>updatePhoto(i, e.target.value)}
            placeholder="Photo URL"
            className="input mb-2"
          />
        ))}
        <button type="button" onClick={addPhoto} className="text-blue-600">
          + Add Photo
        </button>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2">{isEdit ? "Update" : "Add"} Event</button>
      <button type="button" onClick={onCancel} className="bg-slate-300 text-slate-700 px-4 py-2 rounded ml-2">
        Cancel
      </button>
    </form>
  );
};

export default TimelineForm;