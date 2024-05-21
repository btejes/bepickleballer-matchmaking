'use client';

// ProfilePage.jsx
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/library/ProfileCard';
import ProfileForm from '@/library/ProfileForm';

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

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-2 py-4">
        <div className="max-w-4xl mx-auto p-4 border border-gray-300 rounded-md shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-stretch">
            <div className="lg:flex-1 px-2 py-2">
              <ProfileCard profile={profile} />
            </div>
            <div className="lg:flex-1 px-2 py-2">
              <ProfileForm profile={profile} onProfileChange={handleProfileChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
