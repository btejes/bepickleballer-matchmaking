import React from 'react';
import ProfileCard from '@/library/ProfileCard';

const Modal = ({ match, onClose, onUnmatch }) => {
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
        console.log('Unmatch response:', result); // Check the response

        onUnmatch(match.matchId); // Only update the state without making another API call
        onClose();
      } catch (error) {
        console.error('Error unmatching:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <div className="bg-white rounded-lg p-4 w-96 relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ×
        </button>
        <ProfileCard profile={match} />
        <p className="mt-2">Email: {match.email}</p>
        <p>Phone: {match.phone}</p>
        <div className="flex justify-between mt-4">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={handleUnmatchClick}
          >
            Unmatch
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Rate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
