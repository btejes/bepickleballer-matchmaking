// src/app/matches/MatchCard.jsx
import React from 'react';

const MatchCard = ({ match, onClick }) => {
  console.log("Match profile image URL:", match.profileImage); 
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-4 shadow-md w-full max-w-2xl mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="w-24 h-24 rounded-full overflow-hidden mr-5">
          <img 
            src={match.profileImage} 
            alt=""
            className={`w-full h-full  object-cover aspect-ratio ${!match.profileImage && 'blur-sm grayscale bg-gray-300'}`}
            onError={(e) => { e.target.src = `${apiBasePath}/blank-profile-picture.svg`; }}
          />
        </div>
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
