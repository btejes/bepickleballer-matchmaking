'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

const ProfilePage = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto p-8 flex flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg shadow-lg mb-8 lg:mb-0">
          <div className="flex flex-col items-center">
            <div className="bg-gray-300 w-full h-48 mb-4 flex items-center justify-center">
              <span>150 x 150</span>
            </div>
            <input type="file" className="mb-4" />
            <hr className="w-full mb-4" />
            <div className="w-full text-left">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">DUPR:</span>
                <span>{profile.duprRating}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Age:</span>
                <span>{profile.ageRange}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Level:</span>
                <span>{profile.skillLevel}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">About:</span>
                <span>{profile.about}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 lg:pl-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="" disabled selected>
                  Unselected
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold">Your Age Range</label>
              <select
                name="ageRange"
                value={profile.ageRange}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="" disabled selected>
                  Select Age Range
                </option>
                <option value="0-9">0-9</option>
                <option value="10-17">10-17</option>
                <option value="18-19">18-19</option>
                <option value="20-29">20-29</option>
                <option value="30-39">30-39</option>
                <option value="40-49">40-49</option>
                <option value="50-59">50-59</option>
                <option value="60-69">60-69</option>
                <option value="70-79">70-79</option>
                <option value="80-89">80-89</option>
                <option value="90-99">90-99+</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">DUPR Rating</label>
              <input
                type="number"
                name="duprRating"
                value={profile.duprRating}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                step="0.1"
                min="0"
                max="6"
              />
            </div>
            <div>
              <label className="block font-semibold">Your Skill Level</label>
              <select
                name="skillLevel"
                value={profile.skillLevel}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="" disabled selected>
                  Select Skill Level
                </option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Zip Code</label>
              <input
                type="number"
                name="zipCode"
                value={profile.zipCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                maxLength="5"
              />
            </div>
            <div>
              <label className="block font-semibold">Open For Matches</label>
              <select
                name="openForMatches"
                value={profile.openForMatches}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold">About You</label>
            <textarea
              name="about"
              value={profile.about}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            ></textarea>
          </div>
          <hr className="mb-4" />
          <h3 className="font-semibold text-lg">Contact Information</h3>
          <p className="text-sm mb-4">If you are matched, this information will be shared with your match.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white font-semibold p-2 rounded-md">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
