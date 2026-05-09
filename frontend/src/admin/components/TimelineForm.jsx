import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TimelineForm = ({ token, initialData, onSuccess, onCancel }) => {

  const [formData, setFormData] = useState({
    event_title: '',
    event_subtitle: '',
    event_description: '',
    event_date: ''
  });

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        event_title: initialData.event_title || '',
        event_subtitle: initialData.event_subtitle || '',
        event_description: initialData.event_description || '',
        event_date: initialData.event_date || ''
      });
    }
  }, [initialData]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append("event_title", formData.event_title);
    form.append("event_subtitle", formData.event_subtitle);
    form.append("event_description", formData.event_description);
    form.append("event_date", formData.event_date);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (isEdit) {
        await axios.put(`/api/timeline/${initialData.event_id}`, form, config);
      } else {
        await axios.post('/api/timeline', form, config);
      }

      onSuccess();

    } catch (err) {
      console.log(err);
      alert("Error saving event");
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        value={formData.event_title}
        onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
        placeholder="Title"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
        required
      />

      <input
        value={formData.event_subtitle}
        onChange={(e) => setFormData({ ...formData, event_subtitle: e.target.value })}
        placeholder="Subtitle"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
        required
      />

      <textarea
        value={formData.event_description}
        onChange={(e) => setFormData({ ...formData, event_description: e.target.value })}
        placeholder="Description"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
        required
      />

      <input
        type="date"
        value={formData.event_date}
        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
        required
      />


      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold"
        >
          {isEdit ? "Update" : "Add"} Event
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

export default TimelineForm;