import React, { useState, useEffect } from 'react';

const ProfileForm = ({ profile, onProfileChange, onProfileSave, isUploading }) => {
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    if (Object.values(formData).some(value => value !== undefined && value !== '')) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [formData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setMessage('');
          setFadeOut(false);
          setIsSaving(false);
        }, 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const zipCode = formData.zipCode;
    if (/^\d{5}$/.test(zipCode)) {
      handleZipCodeChange(zipCode);
    }
  }, [formData.zipCode]);

  const handleZipCodeChange = async (zipCode) => {
    const basePath = '/matchmaking';
    try {
      const response = await fetch(`${basePath}/api/get-city-by-zipcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ zipCode }),
      });

      if (response.status === 404) {
        setErrors((prevErrors) => ({ ...prevErrors, zipCode: 'City not found for the provided ZIP code' }));
      } else if (response.status === 500) {
        const { error } = await response.json();
        console.error('Error:', error);
        setErrors((prevErrors) => ({ ...prevErrors, zipCode: 'Internal server error' }));
      } else if (!response.ok) {
        throw new Error('Network response was not ok');
      } else {
        const data = await response.json();
        if (data.city) {
          setFormData((prevData) => ({ ...prevData, city: data.city }));
          onProfileChange((prevData) => ({ ...prevData, city: data.city }));
        }
      }
    } catch (error) {
      console.error('Error fetching city:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    let error = '';

    if (name === 'zipCode') {
      if (/^\d{0,5}$/.test(updatedValue)) {
        const newFormData = { ...formData, zipCode: updatedValue };
        setFormData(newFormData);
        onProfileChange(newFormData);
      }
    } else if (name === 'duprRating') {
      if (updatedValue === '' || (/^(2(\.\d{1,2})?|[3-7](\.\d{1,2})?|8(\.0{0,2})?)$/.test(updatedValue))) {
        updatedValue = value;
      } else {
        error = 'DUPR Rating must be a number between 2.0 and 8.0 with up to 2 decimal places.';
      }
    } else if (name === 'phone') {
      if (/^\d{0,10}$/.test(updatedValue)) {
        updatedValue = value;
      } else {
        error = 'Phone number must be 10 digits.';
      }
    } else if (name === 'email') {
      updatedValue = value;
      if (!/\S+@\S+\.\S+/.test(updatedValue)) {
        error = 'Must be a valid email.';
      }
    } else if (name === 'aboutYou') {
      if (updatedValue.length <= 140) {
        updatedValue = value;
      } else {
        error = 'About You must be 140 characters or less.';
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    setFormData((prevData) => ({ ...prevData, [name]: updatedValue }));
    onProfileChange({ ...formData, [name]: updatedValue });
  };

  const handleKeyPress = (e, name) => {
    const charCode = e.which ? e.which : e.keyCode;
    const charStr = String.fromCharCode(charCode);

    if (name === 'zipCode' || name === 'phone') {
      if (!/^\d$/.test(charStr)) {
        e.preventDefault();
      }
    } else if (name === 'duprRating') {
      if (!/^\d$/.test(charStr) && charStr !== '.') {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await onProfileSave(formData);
    if (result.status !== 200) {
      setMessage(`Error code: ${result.status}, message: ${result.statusText}`);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-3xl shadow-md text-black max-w-2xl mx-auto">
      <div className="flex flex-row lg:flex-row">
          <div className="w-full sm:w-1/2 lg:w-1/2 p-2">
              <label htmlFor="firstName">First Name</label>
              <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              />
              <label htmlFor="gender">Gender</label>
              <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
              </select>
              <label htmlFor="duprRating">DUPR Rating</label>
              <input
                  type="number"
                  id="duprRating"
                  name="duprRating"
                  value={formData.duprRating || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'duprRating')}
                  min="2.0"
                  max="8.0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              />
              {errors.duprRating && <span className="text-red-500 text-sm">{errors.duprRating}</span>}
              <label htmlFor="zipCode">Zip Code</label>
              <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'zipCode')}
                  maxLength="5"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              />
              {errors.zipCode && <span className="text-red-500 text-sm">{errors.zipCode}</span>}
              <label htmlFor="rightieLeftie">Rightie/Leftie</label>
              <select
                  id="rightieLeftie"
                  name="rightieLeftie"
                  value={formData.rightieLeftie || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="Rightie">Rightie</option>
                  <option value="Leftie">Leftie</option>
                  <option value="Right & Leftie">Both</option>
              </select>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/2 p-2">
              <label htmlFor="ageRange">Age Range</label>
              <select
                  id="ageRange"
                  name="ageRange"
                  value={formData.ageRange || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="18-29">18-29</option>
                  <option value="30-39">30-39</option>
                  <option value="40-49">40-49</option>
                  <option value="50-59">50-59</option>
                  <option value="60-69">60-69</option>
                  <option value="70-79">70-79</option>
                  <option value="80-89">80-89</option>
                  <option value="99+">99+</option>
              </select>
              <label htmlFor="skillLevel">Skill Level</label>
              <select
                  id="skillLevel"
                  name="skillLevel"
                  value={formData.skillLevel || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
              </select>
              <label htmlFor="openForMatches">Open For Matches</label>
              <select
                  id="openForMatches"
                  name="openForMatches"
                  value={formData.openForMatches || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
              </select>
              <label htmlFor="casualCompetitive">Play Style</label>
              <select
                  id="casualCompetitive"
                  name="casualCompetitive"
                  value={formData.casualCompetitive || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="casual">Casual</option>
                  <option value="competitive">Competitive</option>
              </select>
              <label htmlFor="outdoorIndoor">Indoor/Outdoor</label>
              <select
                  id="outdoorIndoor"
                  name="outdoorIndoor"
                  value={formData.outdoorIndoor || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              >
                  <option value="">Unselected</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="Indoor/Outdoor">Both</option>
              </select>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col relative">
              <div className="relative">
                  <textarea
                      id="aboutYou"
                      name="aboutYou"
                      value={formData.aboutYou || ''}
                      onChange={handleChange}
                      placeholder="About You"
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                      maxLength="140"
                  />
                  <small className={`text-sm ${formData.aboutYou?.length > 140 ? 'text-red-500' : 'text-gray-500'} absolute bottom-2 right-2`}>
                      {formData.aboutYou?.length || 0}/140
                  </small>
              </div>
          </div>
          <div className="col-span-2 flex justify-left">
              <small className="text-gray-500">
                  Only accepted matches see phone and email below
              </small>
          </div>
          <div className="col-span-1 flex flex-row items-center space-x-4">
              <label htmlFor="phone" className="w-1/3">Phone</label>
              <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'phone')}
                  maxLength="10"
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm p-1 text-center"
                  style={{ width: '12ch' }}
                  autoComplete="off"
              />
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
          </div>
          <div className="col-span-1 flex flex-row items-center space-x-4">
              <label htmlFor="email" className="w-1/3">Email</label>
              <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 mb-4 text-center"
                  style={{ width: '30ch' }}
                  autoComplete="off"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
          </div>
      </div>

      {message && (
          <div
              className={`text-center p-2 rounded ${fadeOut ? 'opacity-0 transition-opacity duration-1000' : 'opacity-100'}`}
              style={{
                  color: message.startsWith('Error') ? 'red' : 'green',
                  transition: 'opacity 1s ease-in-out',
              }}
          >
              {message}
          </div>
      )}

      <div className="flex justify-center">
          <button
              type="submit"
              disabled={!isFormReady || isSaving || isUploading}
              style={{
                  width: '50%',
                  backgroundColor: !isFormReady || isSaving || isUploading ? 'grey' : 'blue',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '25px',
                  textAlign: 'center',
              }}
          >
              Save Profile
          </button>
      </div>
  </form>



    );
  };

  export default ProfileForm;
