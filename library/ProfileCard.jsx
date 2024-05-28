// ProfileCard.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ProfileCard = ({ profile }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (profile.profileImage) {
      setImage(profile.profileImage);
    }
  }, [profile]);

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
    <div className="w-full max-w-sm bg-white border border-gray-300 p-4 rounded-md shadow-md">
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
          <p className="text-sm font-medium text-gray-700 mt-2">
            About: <span className="font-normal" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{profile.aboutYou}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
