'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect, useCallback } from 'react';
import ProfileCard from '@/library/ProfileCard';
import SimpleMatchModal from './SimpleMatchModal';

const LocalPlay = () => {
  const [filters, setFilters] = useState({
    preferredGender: '',
    preferredAgeRange: '',
    preferredSkillLevel: '',
    preferredDUPRRating: '',
    preferredHand: '',
    preferredCourtType: '',
    preferredPlayStyle: '',
  });

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const filtersDisplayed = process.env.NEXT_PUBLIC_FILTERS_DISPLAYED === 'true';

  const [currentMatch, setCurrentMatch] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${basePath}/api/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-store', // Ensure the response is not cached
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [basePath]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchNextMatch = useCallback(async (filters) => {
    try {
      const response = await fetch(`${basePath}/api/matchmaking`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store', // Ensure the response is not cached
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch matchmaking data');
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setCurrentMatch(null);
      } else {
        setCurrentMatch(data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching next match:', error);
      setError('No matches found');
      setCurrentMatch(null);
    }
  }, [basePath]);

  useEffect(() => {
    if (userProfile) {
      fetchNextMatch(filters);
    }
  }, [filters, userProfile, fetchNextMatch]);

  const capitalizeCity = (city) => {
    if (!city) return '';
    return city.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleDecision = async (decision) => {
    try {
      const response = await fetch(`${basePath}/api/matchmaking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store', // Ensure the response is not cached
        },
        credentials: 'include',
        body: JSON.stringify({
          potentialMatchId: currentMatch.userId,
          userDecision: decision,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update matchmaking decision');
      }

      const data = await response.json();
      if (data.matchStatus === 'matched') {
        setIsModalOpen(true);
      } else {
        await fetchNextMatch(filters); // Fetch next match after decision
      }
    } catch (error) {
      console.error('Error updating matchmaking decision:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://bepickleballer.com');
    setCopySuccess('Link copied to clipboard!');
    setTimeout(() => setCopySuccess(''), 5000); // Clear the message after 5 seconds
  };

  const handleModalClose = async () => {
    setIsModalOpen(false);
    await fetchNextMatch(filters); // Fetch next match after closing the modal
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-y-auto">
      <div className="w-full">
        <Navbar />
      </div>
      {userProfile && (
        <div className="w-full text-center text-white font-semibold mt-2">
          Local Play:  <strong><big>{capitalizeCity(userProfile.city)}</big></strong>
        </div>
      )}
      <div className="flex-grow w-full flex flex-col items-center justify-center px-4 space-y-4 lg:space-y-0 lg:flex-row lg:space-x-4">
        {currentMatch ? (
          <div className="flex flex-col items-center justify-center space-y-4 lg:space-y-0 lg:flex-row lg:space-x-4">
            <button
              onClick={() => handleDecision('no')}
              className="hidden lg:block bg-red-500 text-white py-3 px-6 rounded-full lg:order-1 lg:self-center w-auto lg:w-auto"
            >
              No
            </button>
            <div className="order-1 lg:order-2 flex justify-center w-full lg:w-auto">
              <ProfileCard profile={currentMatch} />
            </div>
            <button
              onClick={() => handleDecision('yes')}
              className="hidden lg:block bg-green-500 text-white py-3 px-6 rounded-full lg:order-3 lg:self-center w-auto lg:w-auto"
            >
              Yes
            </button>
          </div>
        ) : (
          <p className="text-center">
            {error === 'No matches found' ? (
              <>
                <strong>No profiles found. Check back soon!</strong>
                <br />
                <br />
                <br />
                <div className="justify-center p-5 text-black text-center bg-gray-200 rounded-3xl shadow-2xl">
                  <span>
                    <strong><big>Want to see more profiles? Spread the word!</big></strong>
                    <br />
                    <br />
                    Share <a href="https://bepickleballer.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0000EE', fontStyle: 'italic' }}><strong><big>BePickleBaller.com</big></strong></a>
                    <button onClick={copyToClipboard} style={{ marginLeft: '10px', cursor: 'pointer', color: '#0000EE' }}>
                      📋
                    </button>
                    {copySuccess && <span style={{ marginLeft: '10px', color: 'green' }}>{copySuccess}</span>}
                    <br />with all your favorite pickleball groups!
                    <br />
                    <br />
                    <strong>More shares = More players = More potential matches for you!</strong>
                  </span>
                </div>
              </>
            ) : (
              error || 'Loading...'
            )}
          </p>
        )}
      </div>
      {currentMatch && (
        <div className="lg:hidden flex flex-row justify-center w-full mb-4 space-x-4">
          <button
            onClick={() => handleDecision('no')}
            className="bg-red-500 text-white py-3 px-6 rounded-full"
          >
            No
          </button>
          <button
            onClick={() => handleDecision('yes')}
            className="bg-green-500 text-white py-3 px-6 rounded-full"
          >
            Yes
          </button>
        </div>
      )}
      {filtersDisplayed && (
        <div className="w-full text-black h-auto p-2 flex justify-center space-x-2 flex-wrap">
          <select
            name="preferredGender"
            value={filters.preferredGender}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select
            name="preferredAgeRange"
            value={filters.preferredAgeRange}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Age Range
            </option>
            <option value="18-29">18-29</option>
            <option value="30-39">30-39</option>
            <option value="40-49">40-49</option>
            <option value="50-59">50-59</option>
            <option value="60-69">60-69</option>
            <option value="70-79">70-79</option>
            <option value="80-89">80-89</option>
            <option value="90+">90+</option>
          </select>
          <select
            name="preferredSkillLevel"
            value={filters.preferredSkillLevel}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Skill Level
            </option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select
            name="preferredDUPRRating"
            value={filters.preferredDUPRRating}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Min DUPR
            </option>
            <option value="1.0">1.0</option>
            <option value="2.0">2.0</option>
            <option value="3.0">3.0</option>
            <option value="4.0">4.0</option>
            <option value="5.0">5.0</option>
            <option value="6.0">6.0</option>
            <option value="7.0">7.0</option>
            <option value="8.0">8.0</option>
          </select>
          <select
            name="preferredHand"
            value={filters.preferredHand}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Preferred Hand
            </option>
            <option value="Rightie">Rightie</option>
            <option value="Leftie">Leftie</option>
          </select>
          <select
            name="preferredCourtType"
            value={filters.preferredCourtType}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Court Type
            </option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Indoor/Outdoor">Indoor/Outdoor</option>
          </select>
          <select
            name="preferredPlayStyle"
            value={filters.preferredPlayStyle}
            onChange={handleFilterChange}
            className="p-1 border rounded w-36"
          >
            <option value="">
              Play Style
            </option>
            <option value="Casual">Casual</option>
            <option value="Competitive">Competitive</option>
          </select>
        </div>
      )}
      <SimpleMatchModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default LocalPlay;
