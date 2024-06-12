import Navbar from '@/components/Navbar';
import ClientButtons from './ClientButtons';

export const metadata = {
  title: 'Matchmaking - Pickleball Matchmaking',
  description: 'Find your Pickleball match',
};

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <ClientButtons />
      </div>
    </div>
  );
};

export default Homepage;
