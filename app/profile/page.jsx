"use client";

import React, { useState, useEffect } from 'react';
import ProfileCard from '@/library/ProfileCard';
import ProfileForm from '@/library/ProfileForm';
import Navbar from '@/components/Navbar';

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
    aboutYou: '',
    phone: '',
    email: '',
  });

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
  };

  const handleProfileSave = async (updatedProfile) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error('Error updating profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Error fetching profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

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
              <ProfileForm profile={profile} onProfileChange={handleProfileChange} onProfileSave={handleProfileSave} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
