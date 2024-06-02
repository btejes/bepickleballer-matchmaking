'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ClientButtons = () => {
  const [profile, setProfile] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [isLocalPlayModalOpen, setIsLocalPlayModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch the user's profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData = await response.json();

        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);

  const handleLocalPlayClick = (e) => {
    if (!profile) {
      e.preventDefault();
      setMissingFields(['firstName', 'lastName', 'gender', 'ageRange', 'duprRating', 'skillLevel', 'zipCode', 'openForMatches', 'aboutYou', 'phone', 'email', 'profileImage']);
      setIsLocalPlayModalOpen(true);
      return;
    }

    const requiredFields = [
      'firstName',
      'lastName',
      'gender',
      'ageRange',
      'duprRating',
      'skillLevel',
      'zipCode',
      'openForMatches',
      'aboutYou',
      'phone',
      'email',
      'profileImage',
    ];

    const missing = requiredFields.filter((field) => !profile[field] || profile[field].trim() === '');

    if (missing.length > 0) {
      e.preventDefault();
      setMissingFields(missing);
      setIsLocalPlayModalOpen(true);
    } else {
      router.push('/local-play');
    }
  };

  const handleTournamentClick = () => {
    setIsTournamentModalOpen(true);
  };

  const closeLocalPlayModal = () => {
    setIsLocalPlayModalOpen(false);
  };

  const closeTournamentModal = () => {
    setIsTournamentModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={handleLocalPlayClick}
        className="w-48 bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-full hover:bg-blue-600 transform hover:-translate-y-1 transition-all"
      >
        Local Play
      </button>

      <button
        onClick={handleTournamentClick}
        className="w-48 bg-yellow-500 text-black font-bold py-4 px-8 rounded-full shadow-full hover:bg-yellow-600 transform hover:-translate-y-1 transition-all"
      >
        Tournaments
      </button>

      {isLocalPlayModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 m-4 max-w-xs max-h-full text-center">
            <h2 className="text-xl font-bold mb-4">Incomplete Profile</h2>
            <p className="mb-4">
              To access local matchmaking, you need to complete your profile. Please fill in all the required fields.
            </p>
            <ul className="list-disc list-inside text-left mb-4">
              {missingFields.map((field) => (
                <li key={field} className="text-red-500">{field}</li>
              ))}
            </ul>
            <a href="/profile" className="text-blue-500 underline block mb-4">Go to Profile</a>
            <button
              onClick={closeLocalPlayModal}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transform hover:-translate-y-1 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isTournamentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 m-4 max-w-xs max-h-full text-center">
            <h2 className="text-xl font-bold mb-4">Feature Coming Soon!</h2>
            <p className="mb-4">
              Tournament matchmaking has not been developed yet. If you have interest in this, email <a href="mailto:ben@bepickleballer.com" className="text-blue-500">ben@bepickleballer.com</a> to show interest in this future feature.
            </p>
            <button
              onClick={closeTournamentModal}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transform hover:-translate-y-1 transition-all mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientButtons;
