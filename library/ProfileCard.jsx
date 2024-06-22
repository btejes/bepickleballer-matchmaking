import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import heic2any from 'heic2any';

const ProfileCard = ({ profile, isProfilePage, setIsUploading }) => {
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
    if (profile.userId && typeof window !== 'undefined') {
      fetchAverageRating(profile.userId);
    }
  }, [profile.userId]);

  useEffect(() => {
    if (statusMessage && !statusMessage.startsWith("Uploading") && statusMessage !== "Saving file") {
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
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
      setAverageRating('N/A');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setStatusMessage(`${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC`);
        setFadeOut(false);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage("File size should not exceed 5MB");
        setFadeOut(false);
        return;
      }

      setStatusMessage("Uploading file");
      setLoading(true);
      setIsUploading(true);
      setFadeOut(false);

      try {
        let processedFile = file;

        if (file.type === 'image/heic') {
          try {
            processedFile = await heic2any({
              blob: file,
              toType: 'image/jpeg',
            });
            processedFile = new File([processedFile], file.name.replace(/\.heic$/, '.jpg'), { type: 'image/jpeg' });
          } catch (error) {
            console.error('Error converting HEIC to JPEG:', error);
            setStatusMessage("Error converting HEIC to JPEG");
            setLoading(false);
            setIsUploading(false);
            setFadeOut(false);
            return;
          }
        }

        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];

          const response = await fetch(`${apiBasePath}/api/imageToJpeg`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ file: { type: processedFile.type, buffer: base64data } }),
          });

          const convertResult = await response.json();

          if (convertResult.error) {
            setStatusMessage(convertResult.error);
            setLoading(false);
            setIsUploading(false);
            setFadeOut(false);
            return;
          } else {
            setStatusMessage("Saving file");
          }

          const convertedImage = convertResult.image;

          // Get a signed URL for uploading the image
          const signedUrlResponse = await fetch(`${apiBasePath}/api/getSignedUrl`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          const signedUrlResult = await signedUrlResponse.json();

          if (signedUrlResult.error) {
            setStatusMessage("Failed to get signed URL");
            setLoading(false);
            setIsUploading(false);
            setFadeOut(false);
            return;
          }

          const url = signedUrlResult.url;

          // Upload the converted image to S3
          const uploadResponse = await fetch(url, {
            method: "PUT",
            body: Buffer.from(convertedImage, 'base64'),
            headers: {
              "Content-Type": 'image/jpeg',
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

          // Update the parent state with the new image URL
          profile.profileImage = imageUrl;

          setStatusMessage("Finished");
          setLoading(false);
          setIsUploading(false);
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        setStatusMessage("Error uploading image");
        setLoading(false);
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-xs bg-white rounded-3xl shadow-md mx-auto overflow-hidden">
      <div className="flex justify-center w-full">
        <div className="relative w-80 h-80 overflow-hidden">
          <Image
            src={image || `${apiBasePath}/blank-profile-picture.svg`}
            alt="Profile"
            className={`object-cover object-center w-full h-full ${!isProfilePage && (!image && 'blur-sm grayscale')} ${isProfilePage ? 'cursor-pointer' : ''}`}
            width={320}
            height={320}
            onError={(e) => { e.target.src = `${apiBasePath}/blank-profile-picture.svg`; }}
            onClick={isProfilePage ? () => {
              if (typeof window !== 'undefined') {
                document.getElementById('imageUpload').click();
              }
            } : null}
          />
          {isProfilePage && typeof window !== 'undefined' && (
            <input
              id="imageUpload"
              type="file"
              onChange={handleImageUpload}
              className="hidden"
            />
          )}
        </div>
      </div>

      <div className="p-4 h-[40%] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-black">{profile.firstName}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-black">{profile.gender}</p>
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
            <p className="text-sm font-medium text-black">DUPR: {profile.duprRating}</p>
            <p className="text-sm font-medium text-black">{profile.ageRange}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-black">{profile.outdoorIndoor}</p>
            <p className="text-sm font-medium text-black">{profile.skillLevel}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm font-medium text-black">{profile.rightieLeftie}</p>
            <p className="text-sm font-medium text-black">{profile.casualCompetitive}</p>
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-sm font-medium text-black mt-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {profile.aboutYou}
          </p>
        </div>
        {statusMessage && (
          <div
            className={`text-center p-2 rounded ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
              color: statusMessage.startsWith('Uploading') || statusMessage === 'Finished' || statusMessage === 'Saving file' ? 'green' : 'red',
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
