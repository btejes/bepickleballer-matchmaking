// src/app/matches/MatchCard.jsx
import React from 'react';

const MatchCard = ({ match, onClick }) => {
  console.log("Match profile image URL:", match.profileImage); // Debug log
  // match.profileImage = match.profileImage.split('url=')[0]; // Remove query parameters
  // console.log(match.profileImage);
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-4 shadow-md w-full max-w-2xl mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <img 
          src={match.profileImage} 
          alt=""
          width={100} 
          height={100} 
          className={`rounded-full mr-5 object-cover aspect-ratio overflow-hidden ${!match.profileImage && 'blur-sm grayscale bg-gray-300'}`}
          onError={(e) => { e.target.src = `${apiBasePath}/blank-profile-picture.svg`; }}
        />
        <div className="flex-grow">
          <h2 className="text-lg font-semibold">{match.firstName} {match.lastName}</h2>
        </div>
        <div className="flex space-x-6">
          <p className="text-gray-600">DUPR: {match.duprRating}</p>
          <p className="text-gray-600">Age: {match.ageRange}</p>
          <p className="text-gray-600">Level: {match.skillLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
