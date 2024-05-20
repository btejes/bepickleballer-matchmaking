// page.jsx

import React, { useState } from 'react';
import ProfileCard from '@/library/ProfileCard';
import ProfileForm from '@/library/ProfileForm';
import Navbar from '@/components/Navbar';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    ageRange: '',
    dupr: '',
    skillLevel: '',
    zipCode: '',
    openForMatches: 'No',
    about: '',
    phone: '',
    email: '',
    imageUrl: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(profile);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-8">
          <ProfileCard profile={profile} setProfile={setProfile} />
          <ProfileForm
            profile={profile}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
