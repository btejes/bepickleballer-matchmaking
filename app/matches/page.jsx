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
    console.log('\nUSE EFFECT CALLED\n');
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${basePath}/api/matches`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      console.log('Fetched matches:', data); // Debug log
      setMatches(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('No matches found');
      setMatches([]);
    }
  };

  const handleMatchClick = (match) => {
    console.log('Match clicked:', match); // Debug log
    setSelectedMatch(match);
  };

  const handleModalClose = () => {
    console.log('Modal closed'); // Debug log
    setSelectedMatch(null);
    setShowRatingModal(false);
  };

  const handleUnmatch = (matchId) => {
    console.log('Removing match from state:', matchId); // Debug log
    setMatches((prevMatches) => prevMatches.filter(match => match.matchId !== matchId));
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
      <div className="flex-grow w-full bg-background flex flex-col items-center justify-start overflow-hidden p-4">
        <h1 className="text-2xl font-bold mb-4 mt-2">Your Matches</h1>
        {matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard key={match._id} match={match} onClick={() => handleMatchClick(match)} />
          ))
        ) : (
          <div className="text-center bg-white text-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-lg font-semibold">
              If you&apos;ve approved a match, we will reach out to them to approve the match as well.<br></br> 
              Check back later to see if they&apos;ve accepted the match.
            </p>
          </div>
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
