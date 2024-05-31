// library/ProfileCard.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ProfileCard = ({ profile }) => {
  const [image, setImage] = useState(null);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    if (profile.profileImage) {
      setImage(profile.profileImage);
    }

    // Only fetch the average rating if profile.userId is defined
    if (profile.userId) {
      fetchAverageRating(profile.userId);
    }
    
  }, [profile]);

  const fetchAverageRating = async () => {
    try {
      console.log("\nprofile.userId for average", profile.userId, "\n");
      const response = await fetch(`/api/ratings/average?rateeUserId=${profile.userId}`);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-xs bg-white border border-gray-300 p-4 rounded-md shadow-md mx-auto">
      <div className="flex flex-col h-96">
        <div className="relative w-full h-1/2 border border-gray-300 rounded-md overflow-hidden">
          <img
            src={image || "/blank-profile-picture.svg"}
            alt="Profile"
            className={`w-full h-full object-cover ${!image && 'blur-sm grayscale'}`}
            onError={(e) => { e.target.src = '/blank-profile-picture.svg'; }}
          />
          <input
            type="file"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="border-t border-gray-300 h-px my-2"></div>
        <div className="h-1/2 pt-4">
          <div className="flex justify-center">
            <p className="text-sm font-bold text-gray-700">{profile.firstName}</p>
            <p className="mx-2 text-sm font-bold text-gray-700">{profile.lastName}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-gray-700">{profile.gender}</p>
            <p className="text-sm font-medium text-gray-700">Age: {profile.ageRange}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-gray-700">DUPR: {profile.duprRating}</p>
            <p className="text-sm font-medium text-gray-700">Level: {profile.skillLevel}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium text-gray-700">Rating:</p>
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
          <p className="text-sm font-medium text-gray-700 mt-2">
            About: <span className="font-normal" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{profile.aboutYou}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
