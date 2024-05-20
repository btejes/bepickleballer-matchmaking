'use client';

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
      <div className="flex flex-col h-96"> {/* Ensuring equal height for top and bottom sections */}
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
        <div className="border-t border-gray-300 h-px my-4"></div> {/* Divider line */}
        <div className="h-1/2 pt-4"> {/* Bottom half */}
          <p className="text-sm font-medium text-gray-700">
            DUPR: <span className="font-normal">{profile?.duprRating || ''}</span>
          </p>
          <p className="text-sm font-medium text-gray-700">
            Age: <span className="font-normal">{profile?.ageRange || ''}</span>
          </p>
          <p className="text-sm font-medium text-gray-700">
            Level: <span className="font-normal">{profile?.skillLevel || ''}</span>
          </p>
          <p className="text-sm font-medium text-gray-700">
            About:
            <span className="block mt-1 font-normal">
              {profile?.about || 'No information provided.'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
