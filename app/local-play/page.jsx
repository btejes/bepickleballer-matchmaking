// src/app/local-play/page.js
'use client';

import Navbar from '@/library/Navbar';
import { useState, useEffect } from 'react';
import ProfileCard from '@/library/ProfileCard';

const LocalPlay = () => {
  const [preferences, setPreferences] = useState({
    preferredGender: '',
    preferredAgeRange: '',
    preferredSkillLevel: '',
    preferredDUPRRating: '',
  });

  const [currentMatch, setCurrentMatch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNextMatch();
  }, []);

  const fetchNextMatch = async () => {
    try {
      const response = await fetch('/api/matchmaking');
      if (!response.ok) {
        throw new Error('Failed to fetch matchmaking data');
      }
      const data = await response.json();
      setCurrentMatch(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching next match:', error);
      setError('No matches found');
      setCurrentMatch(null);
    }
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
      const response = await fetch('/api/matchmaking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="flex-grow w-full bg-gray-200 flex flex-col items-center justify-center overflow-hidden">
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
          <p>{error}</p>
        )}
      </div>
      <div className="w-full h-auto bg-white p-2 flex justify-between">
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
          <option value="18-25">18-25</option>
          <option value="26-35">26-35</option>
          <option value="36-45">36-45</option>
          <option value="46-55">46-55</option>
          <option value="56+">56+</option>
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
        </select>
      </div>
    </div>
  );
};

export default LocalPlay;
