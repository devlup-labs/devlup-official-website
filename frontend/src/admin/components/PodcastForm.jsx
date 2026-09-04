import React, { useState, useEffect } from 'react';
import api from "../../api/axios";


const PodcastForm = ({ token, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    podcast_id: '',
    podcast_title: '',
    podcast_subtitle: '',
    podcast_tags: '',
    podcast_author: '',
    podcast_date: new Date().toISOString().split('T')[0],

    thumbnail: null,
    podcast_file: null,

    podcast_external_url: ''
  });

  const isEdit = !!initialData;
  const [existingThumbnail, setExistingThumbnail] = useState(null);
const [existingPodcastFile, setExistingPodcastFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        podcast_id: initialData.podcast_id || '',
        podcast_title: initialData.podcast_title || '',
        podcast_subtitle: initialData.podcast_subtitle || '',
        podcast_author: initialData.podcast_author || '',
        podcast_date:
          initialData.podcast_date ||
          new Date().toISOString().split('T')[0],

        podcast_tags: Array.isArray(initialData.podcast_tags)
          ? initialData.podcast_tags.join(', ')
          : (initialData.podcast_tags || ''),

        podcast_external_url:
          initialData.podcast_url || '',

        thumbnail: null,
        podcast_file: null
      });
      // Existing Cloudinary media
      setExistingThumbnail(initialData.podcast_thumbnail || null);
      setExistingPodcastFile(initialData.podcast_media_url || null);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const payload = new FormData();

      payload.append("podcast_title", formData.podcast_title);
      payload.append("podcast_subtitle", formData.podcast_subtitle);
      payload.append("podcast_author", formData.podcast_author);
      payload.append("podcast_date", formData.podcast_date);
      payload.append("podcast_tags", formData.podcast_tags);

      payload.append(
        "podcast_external_url",
        formData.podcast_external_url
      );

      if (formData.thumbnail) {
        payload.append("thumbnail", formData.thumbnail);
      }

      if (formData.podcast_file) {
        payload.append("podcast_file", formData.podcast_file);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (isEdit) {

        await api.put(
          `/podcasts/${formData.podcast_id}`,
          payload,
          config
        );

         alert("Podcast successfully updated!");

      } else {

        await api.post(
          '/podcasts',
          payload,
          config
        );

         alert("Podcast successfully created!");
      }

      onSuccess();

    } catch (err) {

      console.error("Backend Error:", err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        err.message ||
        "Error saving podcast."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar"
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {isEdit && (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Podcast ID
            </label>

            <input
              disabled
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              value={formData.podcast_id}
              placeholder="Auto Generated"
            />
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Author
          </label>

          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_author}
            onChange={(e) =>
              setFormData({
                ...formData,
                podcast_author: e.target.value
              })
            }
            required
            placeholder="John Doe"
          />

        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Title
        </label>

        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_title}
          onChange={(e) =>
            setFormData({
              ...formData,
              podcast_title: e.target.value
            })
          }
          required
          placeholder="The Future of AI"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Subtitle
        </label>

        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_subtitle}
          onChange={(e) =>
            setFormData({
              ...formData,
              podcast_subtitle: e.target.value
            })
          }
          required
          placeholder="A deep dive into neural networks"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Date
          </label>

          <input
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                podcast_date: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Tags
          </label>

          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.podcast_tags}
            onChange={(e) =>
              setFormData({
                ...formData,
                podcast_tags: e.target.value
              })
            }
            placeholder="AI, Tech, Future"
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Thumbnail
        </label>

        <input
          type="file"
          accept="image/*"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) =>
            setFormData({
              ...formData,
              thumbnail: e.target.files[0]
            })
          }
          required={!isEdit}
        />
        {isEdit && existingThumbnail && (
  <div className="mt-2">
    <p className="text-xs text-slate-500 mb-2">
      Current Thumbnail
    </p>

    <img
      src={existingThumbnail}
      alt="Current thumbnail"
      className="w-32 h-20 object-cover rounded-lg border"
    />
  </div>
)}
      </div>

      {/* Podcast File */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Podcast File
        </label>

        <input
          type="file"
          accept="audio/*,video/*"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) =>
            setFormData({
              ...formData,
              podcast_file: e.target.files[0]
            })
          }
        />
        {isEdit && existingPodcastFile && (
  <div className="mt-2">
    <p className="text-xs text-slate-500 mb-2">
      Current Podcast
    </p>

    <audio
      controls
      src={existingPodcastFile}
      className="w-full"
    />
  </div>
)}
      </div>

      {/* External Link */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          External Link (Optional)
        </label>

        <input
          type="url"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.podcast_external_url}
          onChange={(e) =>
            setFormData({
              ...formData,
              podcast_external_url: e.target.value
            })
          }
          placeholder="Spotify / YouTube / External Link"
        />
      </div>

      <div className="flex gap-3 mt-6">

        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
        >
          {isEdit ? "Update Podcast" : "Publish Podcast"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-8 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-2xl font-bold text-slate-600 transition-all"
        >
          Cancel
        </button>

      </div>
    </form>
  );
};

export default PodcastForm;