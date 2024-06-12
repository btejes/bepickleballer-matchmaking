import React, { useState, useEffect } from 'react';

const RatingModal = ({ match, onClose, onBack, existingRating }) => {
  const [rating, setRating] = useState({ honesty: 0, communication: 0, sportsmanship: 0 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoverValue, setHoverValue] = useState({ honesty: 0, communication: 0, sportsmanship: 0 });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating);
      setIsSubmitted(true);
    }
  }, [existingRating]);

  const handleRatingChange = (category, value) => {
    setRating((prevRating) => ({ ...prevRating, [category]: value }));
  };

  const handleMouseEnter = (category, value) => {
    if (!isSubmitted || !existingRating) {
      setHoverValue((prevHover) => ({ ...prevHover, [category]: value }));
    };
   
  };

  const handleMouseLeave = (category) => {
    if (!isSubmitted || !existingRating) {
      setHoverValue((prevHover) => ({ ...prevHover, [category]: 0 }));
    }
  };

  const handleSubmit = async () => {
    if (rating.honesty === 0 || rating.communication === 0 || rating.sportsmanship === 0) {
      setErrorMessage('Minimum One Star per category');
      setTimeout(() => setErrorMessage(''), 3000); // Clear error message after 3 seconds
      return;
    }

    try {
      const response = await fetch(`${basePath}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raterUserId: match.loggedInUserId,
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
      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (category, value, isEditable = true) => {
    return [...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <label
          key={index}
          className="cursor-pointer"
          onMouseEnter={() => handleMouseEnter(category, ratingValue)}
          onMouseLeave={() => handleMouseLeave(category)}
        >
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
            fill={ratingValue <= (hoverValue[category] || value) ? '#ffc107' : '#e4e5e9'}
            xmlns="http://www.w3.org/2000/svg"
            className="star-icon"
          >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.907 1.432 8.184L12 18.896l-7.368 3.901 1.432-8.184-6.064-5.907 8.332-1.151L12 .587z" />
          </svg>
        </label>
      );
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <div className="bg-white text-black rounded-lg p-4 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          ×
        </button>
        {isSubmitted || existingRating ? (
          <div className="text-center">
            <h2 className="text-xl font-bold">Thank You!</h2>
            <p className="text-sm text-black text-center mt-2 mb-4">
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
            <div className="flex justify-between mt-4">
              <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={onBack}>
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">Rate {match.firstName}</h2>
            <p className="text-sm text-black text-center mt-2 mb-4">
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
              <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={onBack}>
                Back
              </button>
              <p className="text-sm text-black text-center mt-2 mb-4">
                Ratings Are Final!
              </p>
              <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
