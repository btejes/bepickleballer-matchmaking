import React, { useState } from 'react';
import ProfileCard from '@/library/ProfileCard';
import RatingModal from './RatingModal';

const Modal = ({ match, onClose, onUnmatch }) => {
  const [showRating, setShowRating] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  const handleUnmatchClick = async () => {
    const confirmed = confirm('Are you sure? Unmatching is permanent and cannot be undone.');
    if (confirmed) {
      try {
        console.log('Preparing to send unmatch request with data:', {
          matchId: match.matchId,
        });

        const response = await fetch('/api/matches/unmatch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchId: match.matchId,
          }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to unmatch');
        }

        const result = await response.json();
        console.log('Unmatch response:', result);

        onUnmatch(match.matchId);
        onClose();
      } catch (error) {
        console.error('Error unmatching:', error);
      }
    }
  };

  const handleRateClick = async () => {
    try {
      const response = await fetch(`/api/ratings?rateeUserId=${match.userId}`);
      if (response.ok) {
        const rating = await response.json();
        setExistingRating(rating);
      } else {
        setExistingRating(null);
      }
      setShowRating(true);
    } catch (error) {
      console.error('Error fetching rating:', error);
      setExistingRating(null);
      setShowRating(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <div className="bg-white rounded-lg p-4 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          ×
        </button>
        {!showRating ? (
          <>
            <ProfileCard profile={match} />
            <p className="mt-2">Email: {match.email}</p>
            <p>Phone: {match.phone}</p>
            <div className="flex justify-between mt-4">
              <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleUnmatchClick}>
                Unmatch
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleRateClick}>
                Rate
              </button>
            </div>
          </>
        ) : (
          <RatingModal match={match} onClose={onClose} existingRating={existingRating} />
        )}
      </div>
    </div>
  );
};

export default Modal;
