'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from './MatchCard';
import Modal from './Modal';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    console.log('\nUSE EFFECT CALLED\n');
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
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
  };

  const handleUnmatch = (matchId) => {
    console.log('Removing match from state:', matchId); // Debug log
    setMatches((prevMatches) => prevMatches.filter(match => match.matchId !== matchId));
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
        <Modal
          match={selectedMatch}
          onClose={handleModalClose}
          onUnmatch={handleUnmatch}
        />
      )}
    </div>
  );
};

export default MatchesPage;
