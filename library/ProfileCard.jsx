'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ProfileCard = ({ profile, isProfilePage }) => {
  const [image, setImage] = useState(profile.profileImage || null);
  const [averageRating, setAverageRating] = useState(null);
  const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (profile.userId) {
      fetchAverageRating(profile.userId);
    }
  }, [profile]);

  const fetchAverageRating = async (userId) => {
    const token = Cookies.get('jwt');
    try {
      const response = await fetch(`${apiBasePath}/api/ratings/average?rateeUserId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating);
      } else {
        setAverageRating('N/A');
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
      setAverageRating('N/A');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const token = Cookies.get('jwt');
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profile.userId);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        const imageUrl = response.data.Location;

        // Update the user's profile with the new image URL
        await axios.post('/api/profile/updateImage', {
          userId: profile.userId,
          profileImage: imageUrl,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setImage(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-xs bg-white border border-gray-300 rounded-3xl shadow-md mx-auto overflow-hidden">
      <div className="relative w-full h-48 rounded-t-3xl overflow-hidden">
        <img
          src={image || `${apiBasePath}/blank-profile-picture.svg`}
          alt="Profile"
          className={`w-full h-full object-cover ${!image && 'blur-sm grayscale'} ${isProfilePage ? 'cursor-pointer' : ''}`}
          onError={(e) => { e.target.src = `${apiBasePath}/blank-profile-picture.svg`; }}
          onClick={isProfilePage ? () => document.getElementById('imageUpload').click() : null}
        />
        {isProfilePage && (
          <input
            id="imageUpload"
            type="file"
            onChange={handleImageUpload}
            className="hidden"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-700">{profile.firstName} {profile.lastName}</p>
            <div className="flex items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#ffc107"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.907 1.432 8.184L12 18.896l-7.368 3.901 1.432-8.184-6.064-5.907 8.332-1.151L12 .587z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                {typeof averageRating === 'number' ? averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-gray-700">{profile.gender}</p>
            <p className="text-sm font-medium text-gray-700">{profile.ageRange}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-gray-700">DUPR: {profile.duprRating}</p>
            <p className="text-sm font-medium text-gray-700">{profile.skillLevel}</p>
          </div>
          <p className="text-sm font-medium text-gray-700 mt-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {profile.aboutYou}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
