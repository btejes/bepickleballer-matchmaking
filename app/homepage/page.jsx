import Navbar from '@/components/Navbar';
import ClientButtons from './ClientButtons';

export const metadata = {
  title: 'Matchmaking - Pickleball Matchmaking',
  description: 'Find your Pickleball match',
};

const Homepage = () => {
  return (
    <div className="min-h-screen bg-lightGreen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-center text-black">
          Looking for a Pickleball Partner?
        </h1>
        <ClientButtons />
      </div>
    </div>
  );
};

export default Homepage;
