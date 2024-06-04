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
  const [message, setMessage] = useState('');

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
        const errorData = await response.json();
        return {
          status: response.status,
          statusText: errorData.error || response.statusText,
        };
      }

      const data = await response.json();
      setProfile(data);
      return {
        status: 200,
        message: 'Profile saved successfully!',
      };
    } catch (error) {
      console.error('Error saving profile:', error);
      return {
        status: 500,
        statusText: 'Internal Server Error',
      };
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
      <div className="container mx-auto px-2">
        <div className="max-w-4xl mx-auto p-4 rounded-md">
          <div className="flex flex-col lg:flex-row justify-between items-stretch">
            <div className="order-2 lg:order-1 lg:flex-1 px-2 py-2">
              <ProfileCard profile={profile} isProfilePage={true} />
            </div>
            <div className="order-1 lg:order-2 lg:flex-1 px-2 py-2">
              <ProfileForm profile={profile} onProfileChange={handleProfileChange} onProfileSave={handleProfileSave} />
              {message && (
                <div
                  className={`mt-4 text-center p-2 rounded ${fadeOut ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'}`}
                  style={{
                    color: message.startsWith('Error') ? 'red' : 'green',
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;