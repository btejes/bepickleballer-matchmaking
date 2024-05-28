import React, { useState, useEffect } from 'react';

const ProfileForm = ({ profile, onProfileChange, onProfileSave }) => {
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    console.log('ProfileForm useEffect - profile:', profile);
    setFormData(profile);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form change - name:', name, 'value:', value);
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    onProfileChange({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onProfileSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-1">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        >
          <option value="">Unselected</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="col-span-1">
        <label htmlFor="ageRange">Age Range</label>
        <select
          id="ageRange"
          name="ageRange"
          value={formData.ageRange || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        >
          <option value="">Unselected</option>
          <option value="18-25">18-25</option>
          <option value="26-35">26-35</option>
          <option value="36-45">36-45</option>
          <option value="46-60">46-60</option>
          <option value="60+">60+</option>
        </select>
      </div>
      <div className="col-span-1">
        <label htmlFor="duprRating">DUPR Rating</label>
        <input
          type="text"
          id="duprRating"
          name="duprRating"
          value={formData.duprRating || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="skillLevel">Skill Level</label>
        <select
          id="skillLevel"
          name="skillLevel"
          value={formData.skillLevel || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        >
          <option value="">Unselected</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="col-span-1">
        <label htmlFor="zipCode">Zip Code</label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="openForMatches">Open For Matches</label>
        <select
          id="openForMatches"
          name="openForMatches"
          value={formData.openForMatches || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div className="col-span-2">
        <label htmlFor="about">About You</label>
        <textarea
          id="about"
          name="about"
          value={formData.about || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
        <small className={`text-sm ${formData.about?.length >= 140 ? 'text-red-500' : 'text-gray-500'}`}>
          {formData.about?.length}/140
        </small>
      </div>
      <div className="col-span-1">
        <label htmlFor="phone">Phone</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
        />
      </div>
      <div className="col-span-2 mt-6">
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md shadow-md">
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
