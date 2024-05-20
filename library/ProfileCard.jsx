"use client";
import React, { useState } from 'react';

const ProfileCard = ({ profile }) => {
  const [image, setImage] = useState(null);

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
      <div className="relative w-full h-56 mb-4 border border-gray-300 rounded-md overflow-hidden">
        {image ? (
          <img
            src={image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            <span>Click to upload an image</span>
          </div>
        )}
        <input
          type="file"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="border-t border-gray-300 mt-4 pt-4">
        <p className="text-sm font-medium text-gray-700">
          DUPR: <span className="font-normal">{profile.duprRating}</span>
        </p>
        <p className="text-sm font-medium text-gray-700">
          Age: <span className="font-normal">{profile.ageRange}</span>
        </p>
        <p className="text-sm font-medium text-gray-700">
          Level: <span className="font-normal">{profile.skillLevel}</span>
        </p>
        <p className="text-sm font-medium text-gray-700">
          About:
          <span className="block mt-1 font-normal">
            {profile.about || 'No information provided.'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
