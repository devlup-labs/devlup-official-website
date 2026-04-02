import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamForm = ({ token, initialData, onSuccess, onCancel }) => {

  const [formData, setFormData] = useState({
    member_id: '',
    member_name: '',
    member_image: '',
    member_roll_number: '',
    member_designation: '',
    member_tag: '',
    member_about: '',
    member_github_id: '',
    member_linkedin: '',
    member_email: '',
    member_hidden_code: '',
    member_hidden_avatar: '',
    member_hidden_quote: '',
    member_hidden_comments: '',
    member_hidden_contributions: []
  });

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData.member,
        ...initialData.hidden,
        member_hidden_comments: initialData.hidden?.member_hidden_comments?.join(', ') || '',
        member_hidden_contributions: initialData.hidden?.member_hidden_contributions || []
      });
    }
  }, [initialData]);

  // 🔹 Add Contribution
  const addContribution = () => {
    setFormData({
      ...formData,
      member_hidden_contributions: [
        ...formData.member_hidden_contributions,
        {
          contribution_id: '',
          contribution_title: '',
          contribution_description: ''
        }
      ]
    });
  };

  // 🔹 Handle Contribution Change
  const handleContributionChange = (index, field, value) => {
    const updated = [...formData.member_hidden_contributions];
    updated[index][field] = value;
    setFormData({ ...formData, member_hidden_contributions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      member: {
        member_id: formData.member_id,
        member_name: formData.member_name,
        member_image: formData.member_image,
        member_roll_number: formData.member_roll_number,
        member_designation: formData.member_designation,
        member_tag: formData.member_tag,
        member_about: formData.member_about,
        member_github_id: formData.member_github_id,
        member_linkedin: formData.member_linkedin,
        member_email: formData.member_email
      },
      hidden: formData.member_hidden_code ? {
        member_hidden_code: formData.member_hidden_code,
        member_hidden_avatar: formData.member_hidden_avatar,
        member_hidden_quote: formData.member_hidden_quote,
        member_hidden_comments: formData.member_hidden_comments
          .split(',')
          .map(c => c.trim())
          .filter(c => c !== ''),
        member_hidden_contributions: formData.member_hidden_contributions
      } : null
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`/api/team/${formData.member_id}`, payload, config);
      } else {
        await axios.post('/api/team', payload, config);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error saving member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">

      {/* -------- PUBLIC DATA -------- */}
      <h3 className="font-bold text-lg">Public Info</h3>

      <input disabled={isEdit} placeholder="Member ID"
        value={formData.member_id}
        onChange={(e)=>setFormData({...formData, member_id:e.target.value})}
        className="input" />

      <input placeholder="Name"
        value={formData.member_name}
        onChange={(e)=>setFormData({...formData, member_name:e.target.value})}
        className="input" />

      <input placeholder="Image URL"
        value={formData.member_image}
        onChange={(e)=>setFormData({...formData, member_image:e.target.value})}
        className="input" />

      <input placeholder="Roll Number"
        value={formData.member_roll_number}
        onChange={(e)=>setFormData({...formData, member_roll_number:e.target.value})}
        className="input" />

      <input placeholder="Designation"
        value={formData.member_designation}
        onChange={(e)=>setFormData({...formData, member_designation:e.target.value})}
        className="input" />

      <input placeholder="Tag"
        value={formData.member_tag}
        onChange={(e)=>setFormData({...formData, member_tag:e.target.value})}
        className="input" />

      <textarea placeholder="About"
        value={formData.member_about}
        onChange={(e)=>setFormData({...formData, member_about:e.target.value})}
        className="input" />

      <input placeholder="GitHub"
        value={formData.member_github_id}
        onChange={(e)=>setFormData({...formData, member_github_id:e.target.value})}
        className="input" />

      <input placeholder="LinkedIn"
        value={formData.member_linkedin}
        onChange={(e)=>setFormData({...formData, member_linkedin:e.target.value})}
        className="input" />

      <input placeholder="Email"
        value={formData.member_email}
        onChange={(e)=>setFormData({...formData, member_email:e.target.value})}
        className="input" />

      {/* -------- HIDDEN DATA -------- */}
      <h3 className="font-bold text-lg mt-6">Hidden Info</h3>

      <input placeholder="Hidden Code"
        value={formData.member_hidden_code}
        onChange={(e)=>setFormData({...formData, member_hidden_code:e.target.value})}
        className="input" />

      <input placeholder="Hidden Avatar"
        value={formData.member_hidden_avatar}
        onChange={(e)=>setFormData({...formData, member_hidden_avatar:e.target.value})}
        className="input" />

      <input placeholder="Hidden Quote"
        value={formData.member_hidden_quote}
        onChange={(e)=>setFormData({...formData, member_hidden_quote:e.target.value})}
        className="input" />

      <input placeholder="Hidden Comments (comma separated)"
        value={formData.member_hidden_comments}
        onChange={(e)=>setFormData({...formData, member_hidden_comments:e.target.value})}
        className="input" />

      {/* -------- CONTRIBUTIONS -------- */}
      <div>
        <h4 className="font-semibold">Contributions</h4>

        {formData.member_hidden_contributions.map((c, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input placeholder="Contribution ID"
              value={c.contribution_id}
              onChange={(e)=>handleContributionChange(i, 'contribution_id', e.target.value)}
              className="input" />

            <input placeholder="Title"
              value={c.contribution_title}
              onChange={(e)=>handleContributionChange(i, 'contribution_title', e.target.value)}
              className="input" />

            <textarea placeholder="Description"
              value={c.contribution_description}
              onChange={(e)=>handleContributionChange(i, 'contribution_description', e.target.value)}
              className="input" />
          </div>
        ))}

        <button type="button" onClick={addContribution} className="mt-2 text-blue-600">
          + Add Contribution
        </button>
      </div>

      {/* -------- BUTTONS -------- */}
      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEdit ? "Update" : "Add"} Member
        </button>

        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

    </form>
  );
};

export default TeamForm;