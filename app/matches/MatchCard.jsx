// src/app/matches/MatchCard.jsx
import React from 'react';

const MatchCard = ({ match, onClick }) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  console.log("Match profile image URL:", match.profileImage); 
  return (
    <div className="bg-white border text-black border-gray-300 rounded-3xl p-4 shadow-md w-full max-w-2xl mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="w-24 h-24 rounded-full overflow-hidden mr-5">
          <img 
            src={match.profileImage} 
            alt=""
            className={`w-full h-full object-cover ${!match.profileImage && 'blur-sm grayscale bg-gray-300'}`}
            onError={(e) => { e.target.src = `${basePath}/blank-profile-picture.svg`; }}
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-lg font-semibold">{match.firstName}</h2>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
          <p className="text-black">DUPR: {match.duprRating}</p>
          <p className="text-black">Age: {match.ageRange}</p>
          <p className="text-black">Level: {match.skillLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
