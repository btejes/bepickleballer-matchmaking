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
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-8 text-center text-black">
          What Do You Need A Partner Pickle Baller For?
        </h1>
        <ClientButtons />
      </div>
    </div>
  );
};

export default Homepage;
