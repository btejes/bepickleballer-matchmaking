import React, { useState, useEffect } from 'react';

const ProfileForm = ({ profile, onProfileChange, onProfileSave }) => {
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('ProfileForm useEffect - profile:', profile);
    setFormData(profile);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form change - name:', name, 'value:', value);

    let updatedValue = value;
    let error = '';

    if (name === 'zipCode') {
      if (/^\d{0,5}$/.test(value)) {
        updatedValue = value;
      } else {
        error = 'Zip Code must be 5 digits.';
      }
    } else if (name === 'duprRating') {
      if (value === '' || (/^(2(\.\d{1,2})?|[3-7](\.\d{1,2})?|8(\.0{0,2})?)$/.test(value))) {
        updatedValue = value;
      } else {
        error = 'DUPR Rating must be a number between 2.0 and 8.0 with up to 2 decimal places.';
      }
    } else if (name === 'phone') {
      if (/^\d{0,10}$/.test(value)) {
        updatedValue = value;
      } else {
        error = 'Phone number must be 10 digits.';
      }
    } else if (name === 'email') {
      updatedValue = value;
      if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Email must be valid.';
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
    console.log('Form submitted:', formData);
    onProfileSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 flex flex-col">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          >
            <option value="">Unselected</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="col-span-1 flex flex-col">
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
            <option value="90-99+">90-99+</option>
          </select>
        </div>
        <div className="col-span-1 flex flex-col">
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
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="skillLevel">Skill Level</label>
          <select
            id="skillLevel"
            name="skillLevel"
            value={formData.skillLevel || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          >
            <option value="">Unselected</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="col-span-1 flex flex-col">
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
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="openForMatches">Open For Matches</label>
          <select
            id="openForMatches"
            name="openForMatches"
            value={formData.openForMatches || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="col-span-2 flex flex-col">
          <label htmlFor="aboutYou">About You</label>
          <textarea
            id="aboutYou"
            name="aboutYou"
            value={formData.aboutYou || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
          <small className={`text-sm ${formData.aboutYou?.length >= 140 ? 'text-red-500' : 'text-gray-500'}`}>
            {formData.aboutYou?.length}/140
          </small>
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, 'phone')}
            maxLength="10"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
        </div>
        <div className="col-span-1 flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
        </div>
      </div>
      <div className="mt-6">
        <button type="submit" className="w-full" style={{ backgroundColor: 'blue', color: 'white', padding: '10px', borderRadius: '4px', display: 'block' }}>
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
