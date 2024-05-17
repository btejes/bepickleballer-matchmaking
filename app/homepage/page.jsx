// app/homepage/page.jsx
import React from 'react';

export const metadata = {
  title: 'Matchmaking - Pickleball Matchmaking',
  description: 'Find your Pickleball match',
};

const Homepage = async () => {
  // Fetch data here (e.g., from an API or database)
  // const data = await fetch('https://api.example.com/matches').then(res => res.json());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lightGreen">
      <h1 className="text-4xl font-bold mb-12 text-center text-black">Find Your Pickleball Match</h1>
      
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        {/* TODO: Add Matchmaking UI and logic here */}
        <p className="text-center text-darkGray">Matchmaking content goes here.</p>
      </div>
    </div>
  );
};

export default Homepage;
