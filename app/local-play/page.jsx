'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import ProfileCard from '@/library/ProfileCard';

const LocalPlay = () => {
  const [preferences, setPreferences] = useState({
    preferredGender: '',
    preferredAgeRange: '',
    preferredSkillLevel: '',
    preferredDUPRRating: '',
  });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  const [currentMatch, setCurrentMatch] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchNextMatch();
    fetchUserProfile();
  }, []);

  const fetchNextMatch = async () => {
    try {
      const response = await fetch(`${basePath}/api/matchmaking`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-store', // Ensure the response is not cached
        },
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
  };

  const fetchUserProfile = async () => {
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
  };

  const capitalizeCity = (city) => {
    return city.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
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

      await fetchNextMatch(); // Fetch next match after decision
    } catch (error) {
      console.error('Error updating matchmaking decision:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://bepickleballer.com');
    setCopySuccess('Link copied to clipboard!');
    setTimeout(() => setCopySuccess(''), 5000); // Clear the message after 3 seconds
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="w-full">
        <Navbar />
      </div>
      {userProfile && (
        <div className="w-full text-center text-white font-semibold mt-8">
          Local Play:  <strong><big>{capitalizeCity(userProfile.city)}</big></strong>
        </div>
      )}
      <div className="flex-grow w-full flex flex-col items-center justify-center overflow-hidden">
        {currentMatch ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleDecision('no')}
                className="bg-red-500 text-white py-3 px-6 rounded-full"
              >
                No
              </button>
              <ProfileCard profile={currentMatch} />
              <button
                onClick={() => handleDecision('yes')}
                className="bg-green-500 text-white py-3 px-6 rounded-full"
              >
                Yes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center">
            {error === 'No matches found' ? (
              <>
                <strong>No profiles found. Check back soon!</strong>
                <br />
                <br />
                <br />
                <div className="justify-center p-5 text-black text-center bg-gray-300 rounded-3xl shadow-2xl">
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
      <div className="w-full text-black h-auto bg-white p-2 flex justify-between">
        <select
          name="preferredGender"
          value={preferences.preferredGender}
          onChange={handlePreferenceChange}
          className="ml-2 p-1 border rounded"
        >
          <option value="" disabled>
            Preferred Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          name="preferredAgeRange"
          value={preferences.preferredAgeRange}
          onChange={handlePreferenceChange}
          className="ml-2 p-1 border rounded"
        >
          <option value="" disabled>
            Preferred Age Range
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
          value={preferences.preferredSkillLevel}
          onChange={handlePreferenceChange}
          className="ml-2 p-1 border rounded"
        >
          <option value="" disabled>
            Preferred Skill Level
          </option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          name="preferredDUPRRating"
          value={preferences.preferredDUPRRating}
          onChange={handlePreferenceChange}
          className="ml-2 p-1 border rounded"
        >
          <option value="" disabled>
            Preferred DUPR Rating
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
      </div>
    </div>
  );
};

export default LocalPlay;
