"use client";
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
    // Handle form submission
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={profile.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={profile.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              value={profile.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>
                Unselected
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">
              Your Age Range
            </label>
            <select
              name="ageRange"
              id="ageRange"
              value={profile.ageRange}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>
                Unselected
              </option>
              <option value="0-9">0-9</option>
              <option value="10-17">10-17</option>
              <option value="18-29">18-29</option>
              <option value="30-39">30-39</option>
              <option value="40-49">40-49</option>
              <option value="50-59">50-59</option>
              <option value="60-69">60-69</option>
              <option value="70-79">70-79</option>
              <option value="80-89">80-89</option>
              <option value="90-99+">90-99+</option>
            </select>
          </div>
          <div>
            <label htmlFor="duprRating" className="block text-sm font-medium text-gray-700">
              DUPR Rating
            </label>
            <input
              type="number"
              step="0.1"
              name="duprRating"
              id="duprRating"
              value={profile.duprRating}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
              Your Skill Level
            </label>
            <select
              name="skillLevel"
              id="skillLevel"
              value={profile.skillLevel}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>
                Unselected
              </option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code
            </label>
            <input
              type="text"
              name="zipCode"
              id="zipCode"
              maxLength="5"
              value={profile.zipCode}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="openForMatches" className="block text-sm font-medium text-gray-700">
              Open For Matches
            </label>
            <select
              name="openForMatches"
              id="openForMatches"
              value={profile.openForMatches}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="about" className="block text-sm font-medium text-gray-700">
            About You
          </label>
          <textarea
            name="about"
            id="about"
            maxLength="300"
            value={profile.about}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="4"
          />
          <div className="text-right text-gray-500 text-sm">
            {profile.about.length}/300
          </div>
        </div>
        <div className="mt-8 border-t border-gray-300 pt-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <p className="text-sm text-gray-500">
            If you are matched, this information will be shared with your match.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
