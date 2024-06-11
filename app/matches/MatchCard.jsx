// src/app/matches/MatchCard.jsx
import React from 'react';
import Image from 'next/image';

const MatchCard = ({ match, onClick }) => {
  console.log("Match profile image URL:", match.profileImage); // Debug log
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-4 shadow-md w-full max-w-2xl mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <Image 
          src={match.profileImage} 
          alt="MatchCard"
          width={64} 
          height={64} 
          className="rounded-full mr-4" 
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
