import React, { useState, useEffect } from 'react';
import ProfileCard from '@/library/ProfileCard';
import RatingModal from './RatingModal';
import ConfirmationDialog from './ConfirmationDialog';

const Modal = ({ match, onClose, onUnmatch }) => {
  const [showRating, setShowRating] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const ratingMinimumMinutes = process.env.NEXT_PUBLIC_RATING_MINIMUM_MINUTES || 1440; // Default to 1440 minutes (24 hours) if not set

  useEffect(() => {
    const checkElapsedTime = () => {
      const matchCreationTime = new Date(match.createdAt);
      const currentTime = new Date();

      console.log(`Match creation time: ${match.createdAt}`);
      console.log(`Parsed match creation time: ${matchCreationTime}`);
      console.log(`Current time: ${currentTime}`);

      const elapsedTime = currentTime - matchCreationTime;
      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);

      console.log(`Elapsed time in minutes: ${elapsedTimeInMinutes}`);

      if (elapsedTimeInMinutes >= ratingMinimumMinutes) {
        setCanRate(true);
      } else {
        setCanRate(false);
      }
    };

    checkElapsedTime();
  }, [match.createdAt, ratingMinimumMinutes]);

  const handleUnmatchClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmUnmatch = async () => {
    setShowConfirmation(false);
    try {
      const response = await fetch(`${basePath}/api/matches/unmatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.matchId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unmatch');
      }

      const result = await response.json();
      onUnmatch(match.matchId);
      onClose();
    } catch (error) {
      console.error('Error unmatching:', error);
    }
  };

  const handleCancelUnmatch = () => {
    setShowConfirmation(false);
  };

  const handleRateClick = async () => {
    try {
      const response = await fetch(`${basePath}/api/ratings?rateeUserId=${match.userId}&raterUserId=${match.loggedInUserId}`);
      if (response.ok) {
        const rating = await response.json();
        setExistingRating(rating);
        if (rating) {
          setShowRating('thankyou');
        } else {
          setShowRating('rating');
        }
      } else {
        setExistingRating(null);
        setShowRating('rating');
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
      setExistingRating(null);
      setShowRating('rating');
    }
  };

  const handleBack = () => {
    setShowRating(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <div className="bg-white text-black rounded-3xl p-4 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          ×
        </button>
        {!showRating ? (
          <>
            <ProfileCard profile={match} />
            <div className="px-4 text-center">
              <p className="mt-2 text-sm"><strong>Phone:</strong> {match.phone}</p>
              <p className="mt-1 text-sm"><strong>Email:</strong> {match.email}</p>
              <div className="flex justify-between mt-4 space-x-4">
                <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleUnmatchClick}>
                  Unmatch
                </button>
                {canRate && (
                  <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleRateClick}>
                    Rate
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          showRating === 'rating' ? (
            <RatingModal match={match} onClose={onClose} onBack={handleBack} />
          ) : (
            <RatingModal match={match} onClose={onClose} onBack={handleBack} existingRating={existingRating} />
          )
        )}
        {showConfirmation && (
          <ConfirmationDialog
            message="Are you sure? Unmatching is permanent and cannot be undone."
            onConfirm={handleConfirmUnmatch}
            onCancel={handleCancelUnmatch}
          />
        )}
      </div>
    </div>
  );
};

export default Modal;
