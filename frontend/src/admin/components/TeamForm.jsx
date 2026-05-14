import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeamForm = ({ token, initialData, onSuccess, onCancel }) => {

  const [formData, setFormData] = useState({
    member_id: '',
    member_name: '',
    member_image: '',
    member_image_file: null,
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
    if (!initialData) return;

    console.log("INITIAL DATA:", initialData);

    const member = initialData;
    const hidden = initialData.hidden || {};

    setFormData({
      member_id: member.member_id || '',
      member_name: member.member_name || '',
      member_image: member.member_image || '',
      member_image_file: null,
      member_roll_number: member.member_roll_number || '',
      member_designation: member.member_designation || '',

      // FIXED
      member_tag: Array.isArray(member.member_tag)
        ? member.member_tag.join(", ")
        : member.member_tag || '',

      member_about: member.member_about || '',
      member_github_id: member.member_github_id || '',
      member_linkedin: member.member_linkedin || '',
      member_email: member.member_email || '',

      member_hidden_code: hidden.member_hidden_code || '',
      member_hidden_avatar: hidden.member_hidden_avatar || '',
      member_hidden_quote: hidden.member_hidden_quote || '',

      member_hidden_comments: Array.isArray(hidden.member_hidden_comments)
        ? hidden.member_hidden_comments.join(', ')
        : hidden.member_hidden_comments || '',

      member_hidden_contributions:
        hidden.member_hidden_contributions || []
    });

  }, [initialData]);

  const addContribution = () => {
    setFormData(prev => ({
      ...prev,
      member_hidden_contributions: [
        ...prev.member_hidden_contributions,
        {
          contribution_id: '',
          contribution_title: '',
          contribution_description: ''
        }
      ]
    }));
  };

  const removeContribution = (index) => {
    const updated = [...formData.member_hidden_contributions];
    updated.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      member_hidden_contributions: updated
    }));
  };

  const handleContributionChange = (index, field, value) => {
    const updated = [...formData.member_hidden_contributions];
    updated[index][field] = value;

    setFormData(prev => ({
      ...prev,
      member_hidden_contributions: updated
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const memberId =
      initialData?.member_id || formData.member_id;

    const form = new FormData();

    form.append('member_id', formData.member_id);
    form.append('member_name', formData.member_name);

    // only append old URL if no new file selected
    if (!formData.member_image_file && formData.member_image) {
      form.append('member_image', formData.member_image);
    }

    form.append('member_roll_number', formData.member_roll_number);

    form.append(
      'member_designation',
      formData.member_designation.trim()
    );

    // FIXED TAG ARRAY
    const formattedTags = formData.member_tag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    form.append(
      'member_tag',
      JSON.stringify(formattedTags)
    );

    form.append('member_about', formData.member_about);
    form.append('member_github_id', formData.member_github_id);
    form.append('member_linkedin', formData.member_linkedin);
    form.append('member_email', formData.member_email);

    // new image upload
    if (formData.member_image_file) {
      form.append('image', formData.member_image_file);
    }

    const hasHiddenData =
      formData.member_hidden_code ||
      formData.member_hidden_avatar ||
      formData.member_hidden_quote ||
      formData.member_hidden_comments ||
      formData.member_hidden_contributions.length > 0;

    const hiddenPayload = hasHiddenData
      ? {
          member_id: formData.member_id,
          member_hidden_code: formData.member_hidden_code,
          member_hidden_avatar: formData.member_hidden_avatar,
          member_hidden_quote: formData.member_hidden_quote,

          member_hidden_comments:
            formData.member_hidden_comments
              .split(',')
              .map(c => c.trim())
              .filter(c => c !== ''),

          member_hidden_contributions:
            formData.member_hidden_contributions
        }
      : null;

    try {

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let targetMemberId = memberId;

      // PUBLIC DATA
      if (isEdit) {

        if (!targetMemberId) {
          alert("Member ID missing!");
          return;
        }

        await api.put(
          `/team/${targetMemberId}`,
          form,
          config
        );

      } else {

        const response = await api.post(
          `/team`,
          form,
          config
        );

        targetMemberId =
          response.data.member_id || targetMemberId;
      }

      // HIDDEN DATA
      if (hiddenPayload) {

        hiddenPayload.member_id = targetMemberId;

        if (isEdit) {

          await api.put(
            `/team/hidden/${targetMemberId}`,
            hiddenPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

        } else {

          await api.post(
            `/team/hidden/${targetMemberId}`,
            hiddenPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
      }

      onSuccess();

    } catch (err) {

      console.error(err);

      console.error(
        "SERVER ERROR:",
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
        "Error saving member"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[75vh] overflow-y-auto"
    >

      {/* -------- PUBLIC DATA -------- */}

      <h3 className="font-bold text-lg">
        Public Info
      </h3>

      {isEdit && (
        <input
          disabled
          value={formData.member_id}
          className="w-full p-3 bg-slate-100 border rounded-xl"
        />
      )}

      {!isEdit && (
        <input
          required
          placeholder="Member ID"
          value={formData.member_id}
          onChange={(e)=>
            setFormData({
              ...formData,
              member_id:e.target.value
            })
          }
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
        />
      )}

      <input
        required
        placeholder="Name"
        value={formData.member_name}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_name:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      {/* IMAGE FILE */}
      <input
        type="file"
        accept="image/*"
        onChange={(e)=>
          setFormData({
            ...formData,
            member_image_file: e.target.files[0]
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      {/* IMAGE URL EDITABLE */}
      <input
        placeholder="Image URL"
        value={formData.member_image}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_image: e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      {/* IMAGE PREVIEW */}
      {(formData.member_image || formData.member_image_file) && (
        <img
          src={
            formData.member_image_file
              ? URL.createObjectURL(formData.member_image_file)
              : formData.member_image
          }
          alt="preview"
          className="w-24 h-24 rounded-xl object-cover border"
        />
      )}

      <input
        required
        placeholder="Roll Number"
        value={formData.member_roll_number}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_roll_number:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        required
        placeholder="Designation"
        value={formData.member_designation}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_designation:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="Tags (comma separated)"
        value={formData.member_tag}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_tag:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <textarea
        placeholder="About"
        value={formData.member_about}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_about:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="GitHub"
        value={formData.member_github_id}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_github_id:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="LinkedIn"
        value={formData.member_linkedin}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_linkedin:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="Email"
        value={formData.member_email}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_email:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      {/* -------- HIDDEN DATA -------- */}

      <h3 className="font-bold text-lg mt-6">
        Hidden Info
      </h3>

      <input
        placeholder="Hidden Code"
        value={formData.member_hidden_code}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_hidden_code:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="Hidden Avatar"
        value={formData.member_hidden_avatar}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_hidden_avatar:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="Hidden Quote"
        value={formData.member_hidden_quote}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_hidden_quote:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      <input
        placeholder="Hidden Comments (comma separated)"
        value={formData.member_hidden_comments}
        onChange={(e)=>
          setFormData({
            ...formData,
            member_hidden_comments:e.target.value
          })
        }
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
      />

      {/* -------- CONTRIBUTIONS -------- */}
      <div>
        <h4 className="font-semibold">
          Contributions
        </h4>

        {formData.member_hidden_contributions.map((c, i) => (
          <div
            key={i}
            className="border p-3 rounded space-y-2 mt-3"
          >

            <input
              placeholder="Contribution ID"
              value={c.contribution_id}
              onChange={(e)=>
                handleContributionChange(
                  i,
                  'contribution_id',
                  e.target.value
                )
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />

            <input
              placeholder="Title"
              value={c.contribution_title}
              onChange={(e)=>
                handleContributionChange(
                  i,
                  'contribution_title',
                  e.target.value
                )
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />

            <textarea
              placeholder="Description"
              value={c.contribution_description}
              onChange={(e)=>
                handleContributionChange(
                  i,
                  'contribution_description',
                  e.target.value
                )
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />

            <button
              type="button"
              onClick={() => removeContribution(i)}
              className="text-red-600 font-semibold"
            >
              Remove Contribution
            </button>

          </div>
        ))}

        <button
          type="button"
          onClick={addContribution}
          className="mt-2 text-blue-600 font-semibold"
        >
          + Add Contribution
        </button>
      </div>

      {/* -------- BUTTONS -------- */}
      <div className="flex gap-3 mt-6">

        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold"
        >
          {isEdit ? "Update" : "Add"} Member
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

export default TeamForm;