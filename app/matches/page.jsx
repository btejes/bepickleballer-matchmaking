'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from './MatchCard';
import Modal from './Modal';
import RatingModal from './RatingModal';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(`${basePath}/api/profile/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return data.profileImage;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return '';
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${basePath}/api/matches`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();

      const matchesWithImages = await Promise.all(
        data.map(async (match) => {
          const profileImage = await fetchProfile(match.userId);
          return { ...match, profileImage };
        })
      );

      setMatches(matchesWithImages);
      setError(null);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('No matches found');
      setMatches([]);
    }
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleModalClose = () => {
    setSelectedMatch(null);
    setShowRatingModal(false);
  };

  const handleUnmatch = (matchId) => {
    setMatches((prevMatches) => prevMatches.filter((match) => match._id !== matchId));
  };

  const openRatingModal = () => {
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="flex-grow w-full bg-gray-200 flex flex-col items-center justify-start overflow-hidden p-4">
        <h1 className="text-2xl font-bold mb-4 mt-2">Your Matches</h1>
        {matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard key={match._id} match={match} onClick={() => handleMatchClick(match)} />
          ))
        ) : (
          <p>{error}</p>
        )}
      </div>
      {selectedMatch && (
        showRatingModal ? (
          <RatingModal match={selectedMatch} onClose={closeRatingModal} />
        ) : (
          <Modal
            match={selectedMatch}
            onClose={handleModalClose}
            onUnmatch={handleUnmatch}
            onRate={openRatingModal}
          />
        )
      )}
    </div>
  );
};

export default MatchesPage;
