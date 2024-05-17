import React from 'react';


// Fetch initial data for the page.
export async function getStaticProps() {
  // Fetch data here (e.g., from an API or database)
  // const data = await fetch('https://api.example.com/matches').then(res => res.json());

  // Return the data as props
  return {
    props: {
      // data,
    },
    revalidate: 10, // Revalidate every 10 seconds
  };
}

// Homepage component to render the matchmaking page.
const Homepage = (props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lightGreen">
      <Head>
        <title>Matchmaking - Pickleball Matchmaking</title>
        <meta name="description" content="Find your Pickleball match" />
      </Head>
      
      <h1 className="text-4xl font-bold mb-12 text-center text-black">Find Your Pickleball Match</h1>
      
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        {/* TODO: Add Matchmaking UI and logic here */}
        <p className="text-center text-darkGray">Matchmaking content goes here.</p>
      </div>
    </div>
  );
};

export default Homepage;
