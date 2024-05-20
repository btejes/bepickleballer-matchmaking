import Navbar from '@/components/Navbar';
import ProfileCard from '@/library/ProfileCard';
import ProfileForm from '@/library/ProfileForm';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-2 py-4">
        <div className="max-w-4xl mx-auto p-4 border border-gray-300 rounded-md shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-stretch">
            <div className="lg:flex-1 px-2 py-2">
              <ProfileCard />
            </div>
            <div className="lg:flex-1 px-2 py-2">
              <ProfileForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
