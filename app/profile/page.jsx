"use client";

import React, { useState, useEffect } from 'react';
import ProfileCard from '@/library/ProfileCard';
import ProfileForm from '@/library/ProfileForm';
import Navbar from '@/components/Navbar';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    gender: '',
    ageRange: '',
    duprRating: '',
    skillLevel: '',
    zipCode: '',
    city: '',
    openForMatches: '',
    aboutYou: '',
    phone: '',
    email: '',
    profileImage: '',
    casualCompetitive: '',
    outdoorIndoor: '',
  });
  const [message, setMessage] = useState('');

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
  };

  const handleProfileSave = async (updatedProfile) => {
    try {
      // Remove the profileImage field if it exists
      console.log("\nupdatedProfil with imageurl: ", updatedProfile, "\n");
      delete updatedProfile.profileImage;
      console.log("\nupdatedProfil without imageurl: ", updatedProfile, "\n");

      const response = await fetch(`${basePath}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        credentials: 'include', // Include credentials
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
        const response = await fetch(`${basePath}/api/profile`, {
          method: 'GET',
          credentials: 'include', // Include credentials
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-2">
        <div className="max-w-4xl mx-auto p-4 rounded-md">
          <div className="text-black flex flex-col lg:flex-row justify-between items-stretch">
            <div className="order-1 lg:order-1 lg:flex-1 px-2 py-2">
              <ProfileCard profile={profile} isProfilePage={true} />
            </div>
            <div className="order-2 lg:order-2 lg:flex-1 px-2 py-2">
              <ProfileForm profile={profile} onProfileChange={handleProfileChange} onProfileSave={handleProfileSave} />
              {message && (
                <div
                  className="mt-4 text-center p-2 rounded"
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
