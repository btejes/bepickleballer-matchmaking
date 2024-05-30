// src/app/matches/MatchCard.jsx
import React from 'react';

const MatchCard = ({ match, onClick }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-4 shadow-md w-full max-w-md mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center">
        <img src={match.profileImage} alt={`${match.firstName} ${match.lastName}`} className="w-16 h-16 rounded-full mr-4" />
        <div>
          <h2 className="text-lg font-semibold">{match.firstName} {match.lastName}</h2>
          <p className="text-gray-600">DUPR: {match.duprRating} Age: {match.ageRange} Level: {match.skillLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
