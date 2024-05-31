import React, { useState, useEffect } from 'react';

const RatingModal = ({ match, onClose }) => {
  const [rating, setRating] = useState({ honesty: 0, communication: 0, sportsmanship: 0 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchExistingRating();
  }, []);

  const fetchExistingRating = async () => {
    try {
      const response = await fetch(`/api/ratings?rateeUserId=${match.userId}&raterUserId=${match.loggedInUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setRating(data);
          setIsSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching existing rating:', error);
    }
  };

  const handleRatingChange = (category, value) => {
    setRating((prevRating) => ({ ...prevRating, [category]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raterUserId: match.loggedInUserId, // Include raterUserId
          rateeUserId: match.userId,
          honesty: rating.honesty,
          communication: rating.communication,
          sportsmanship: rating.sportsmanship,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (category, value, isEditable = true) => {
    return [...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <label key={index} className="cursor-pointer">
          <input
            type="radio"
            name={category}
            value={ratingValue}
            onClick={() => isEditable && handleRatingChange(category, ratingValue)}
            className="hidden"
          />
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill={ratingValue <= value ? '#ffc107' : '#e4e5e9'}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.907 1.432 8.184L12 18.896l-7.368 3.901 1.432-8.184-6.064-5.907 8.332-1.151L12 .587z" />
          </svg>
        </label>
      );
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <div className="bg-white rounded-lg p-4 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          ×
        </button>
        {isSubmitted ? (
          <div className="text-center">
            <h2 className="text-xl font-bold">Thank You!</h2>
            <p className="text-sm text-gray-500 text-center mt-2 mb-4">
              Thank you for helping to build trust in our community.
            </p>
            <div className="mt-4">
              <label className="block mb-2">Honest estimate of their skill range</label>
              <div className="flex justify-center">
                {renderStars('honesty', rating.honesty, false)}
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-2">Did they communicate well and show up on time?</label>
              <div className="flex justify-center">
                {renderStars('communication', rating.communication, false)}
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-2">Did they show good sportsmanship and graciousness?</label>
              <div className="flex justify-center">
                {renderStars('sportsmanship', rating.sportsmanship, false)}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">Rate {match.firstName}</h2>
            <p className="text-sm text-gray-500 text-center mt-2 mb-4">
              Ratings are anonymous. A player will see their ratings after receiving three ratings for an average.
            </p>
            <div className="mt-4">
              <label className="block mb-2">Honest estimate of their skill range</label>
              <div className="flex justify-center">
                {renderStars('honesty', rating.honesty)}
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-2">Did they communicate well and show up on time?</label>
              <div className="flex justify-center">
                {renderStars('communication', rating.communication)}
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-2">Did they show good sportsmanship and graciousness?</label>
              <div className="flex justify-center">
                {renderStars('sportsmanship', rating.sportsmanship)}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={onClose}>
                Back
              </button>
              <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
