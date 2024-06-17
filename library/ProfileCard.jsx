import React, { useState, useEffect } from 'react';

const ProfileCard = ({ profile, isProfilePage }) => {
  const [image, setImage] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (profile.profileImage) {
      setImage(profile.profileImage);
    }
  }, [profile.profileImage]);

  useEffect(() => {
    if (profile.userId) {
      fetchAverageRating(profile.userId);
    }
  }, [profile.userId]);

  useEffect(() => {
    if (statusMessage) {
      setFadeOut(false);
      const timer1 = setTimeout(() => {
        setFadeOut(true);
      }, 3000);
      const timer2 = setTimeout(() => {
        setStatusMessage('');
        setFadeOut(false);
      }, 4000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [statusMessage]);

  const fetchAverageRating = async (userId) => {
    try {
      const response = await fetch(`${apiBasePath}/api/ratings/average?rateeUserId=${userId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating);
      } else {
        setAverageRating('N/A');
        console.log("\nNot an error just default NA\n");
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
      setAverageRating('N/A');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage("File size should not exceed 5MB");
        setFadeOut(false);
        return;
      }

      setStatusMessage("Uploading file");
      setLoading(true);
      setFadeOut(false);

      try {
        const response = await fetch(`${apiBasePath}/api/getSignedUrl`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const signedUrlResult = await response.json();

        if (signedUrlResult.error) {
          setStatusMessage("Failed to get signed URL");
          setLoading(false);
          setFadeOut(false);
          return;
        }

        const url = signedUrlResult.url;

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const imageUrl = url.split('?')[0];
        setImage(imageUrl);

        const profileResponse = await fetch(`${apiBasePath}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ profileImage: imageUrl }),
        });

        if (!profileResponse.ok) {
          console.error('Error updating profile image:', await profileResponse.json());
        }

        setStatusMessage("Finished");
      } catch (error) {
        console.error('Error uploading image:', error);
        setStatusMessage("Error uploading image");
      }

      setLoading(false);
      setFadeOut(false);
    }
  };

  return (
    <div className="w-full max-w-xs bg-white rounded-3xl shadow-md mx-auto">
      <div className="relative w-full max-h-xs rounded-t-3xl overflow-hidden">
        <img
          src={image || `${apiBasePath}/blank-profile-picture.svg`}
          alt="Profile"
          className={`object-cover w-full h-full rounded-t-3xl ${!isProfilePage && (!image && 'blur-sm grayscale')} ${isProfilePage ? 'cursor-pointer' : ''}`}
          onError={(e) => { e.target.src = `${apiBasePath}/blank-profile-picture.svg`; }}
          onClick={isProfilePage ? () => document.getElementById('imageUpload').click() : null}
        />
        {isProfilePage && (
          <input
            id="imageUpload"
            type="file"
            onChange={handleImageUpload}
            className="hidden"
          />
        )}
      </div>
      <div className="p-4 h-[40%]">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-black">{profile.firstName}</p>
            <div className="flex items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#ffc107"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.907 1.432 8.184L12 18.896l-7.368 3.901 1.432-8.184-6.064-5.907 8.332-1.151L12 .587z" />
              </svg>
              <p className="text-sm font-medium text-black">
                {typeof averageRating === 'number' ? averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-black">{profile.gender}</p>
            <p className="text-sm font-medium text-black">{profile.ageRange}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-black">DUPR: {profile.duprRating}</p>
            <p className="text-sm font-medium text-black">{profile.skillLevel}</p>
          </div>
          <p className="text-sm font-medium text-black mt-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {profile.aboutYou}
          </p>
        </div>

        {statusMessage && (
          <div
            className={`text-center p-2 rounded ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
              color: statusMessage.startsWith('Uploading') || statusMessage === 'Finished' ? 'green' : 'red',
              transition: 'opacity 1s ease-in-out',
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
