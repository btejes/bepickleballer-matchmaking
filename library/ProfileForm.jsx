'use client';

import React, { useState } from 'react';

const ProfileForm = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    ageRange: '',
    duprRating: '',
    skillLevel: '',
    zipCode: '',
    openForMatches: '',
    about: '',
    phone: '',
    email: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile saved:', profile);
  };

  return (
    <form onSubmit={handleSubmit} className="text-xs space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'lastName', label: 'Last Name', type: 'text' },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Unselected', 'Male', 'Female', 'Other'] },
          { name: 'ageRange', label: 'Your Age Range', type: 'select', options: ['Unselected', '0-9', '10-17', '18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99+'] },
          { name: 'duprRating', label: 'DUPR Rating', type: 'number', step: '0.1' },
          { name: 'skillLevel', label: 'Your Skill Level', type: 'select', options: ['Unselected', 'Beginner', 'Intermediate', 'Advanced'] },
          { name: 'zipCode', label: 'Zip Code', type: 'number' },
          { name: 'openForMatches', label: 'Open For Matches', type: 'select', options: ['No', 'Yes'] }
        ].map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block font-medium text-gray-700">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                name={field.name}
                id={field.name}
                value={profile[field.name]}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                {field.options.map(option => (
                  <option key={option} value={option === 'Unselected' ? '' : option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={profile[field.name]}
                onChange={handleInputChange}
                step={field.step || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              />
            )}
          </div>
        ))}
        <div className="col-span-2">
          <label htmlFor="about" className="block font-medium text-gray-700">
            About You
          </label>
          <textarea
            name="about"
            id="about"
            value={profile.about}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
          <small className="text-gray-500">{profile.about.length}/300</small>
        </div>
      </div>
      <div className="border-t border-gray-300 mt-4 pt-4">
        <h3 className="font-medium text-gray-700">Contact Information</h3>
        <p className="text-gray-500 mb-2">
          Only shown to your current matches.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="phone" className="block font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={profile.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
