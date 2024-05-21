import React from 'react';

const ProfileForm = ({ profile, onProfileChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'about' && value.length > 140) return; // Prevent input if over 140 characters for 'about'
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 10) return;
      onProfileChange({ ...profile, [name]: onlyNums });
    } else if (name === 'zipCode') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 7) return;
      onProfileChange({ ...profile, [name]: onlyNums });
    } else if (name === 'duprRating') {
      let duprValue = parseFloat(value);
      if (isNaN(duprValue)) duprValue = '';
      if (duprValue < 0) duprValue = 0;
      if (duprValue > 8) duprValue = 8; // Assuming 8.0 is the maximum DUPR rating
      onProfileChange({ ...profile, [name]: duprValue });
    } else {
      onProfileChange({ ...profile, [name]: value.slice(0, 140) }); // Apply the 140 character limit to 'about'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Profile saved:', profile);
    
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });

    if (response.ok) {
      console.log('Profile saved successfully');
    } else {
      console.error('Error saving profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-xs space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { name: 'firstName', label: 'First Name', type: 'text', width: '15ch' },
          { name: 'lastName', label: 'Last Name', type: 'text', width: '15ch' },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Unselected', 'Male', 'Female', 'Other'] },
          { name: 'ageRange', label: 'Age Range', type: 'select', options: ['Unselected', '0-9', '10-17', '18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99+'] },
          { name: 'duprRating', label: 'DUPR Rating', type: 'number', step: '0.1', width: '4ch' },
          { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Unselected', 'Beginner', 'Intermediate', 'Advanced'] },
          { name: 'zipCode', label: 'Zip Code', type: 'number', width: '7ch' },
          { name: 'openForMatches', label: 'Open For Matches', type: 'select', options: ['No', 'Yes'] }
        ].map(field => (
          <div key={field.name} className="w-full sm:w-1/2 px-1">
            <label htmlFor={field.name} className="block font-medium text-gray-700 whitespace-nowrap">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                name={field.name}
                id={field.name}
                value={profile[field.name]}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                style={{
                  width: field.name === 'openForMatches' ? '80px' : 'auto',
                }}
              >
                {field.options.map(option => (
                  <option key={option} value={option === 'Unselected' ? '' : option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={profile[field.name]}
                onChange={handleInputChange}
                step={field.step || ''}
                className="mt-1 block border border-gray-300 rounded-md shadow-sm p-1"
                style={{
                  width: field.width || 'auto',
                }}
              />
            )}
          </div>
        ))}
        <div className="col-span-2">
          <label htmlFor="about" className="block font-medium text-gray-700">
            About You
          </label>
          <textarea
            name="about"
            id="about"
            value={profile.about}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
          />
          <small className={`text-sm ${profile.about.length >= 140 ? 'text-red-500' : 'text-gray-500'}`}>
            {profile.about.length}/140
          </small>
        </div>
      </div>
      <div className="border-t border-gray-300 mt-4 pt-4">
        <h3 className="font-medium text-gray-700">Contact Information</h3>
        <p className="text-gray-500 mb-2">
          Only shown to your current matches.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="w-10/12 mx-auto">
            <label htmlFor="phone" className="block font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={profile.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
              maxLength="10"
            />
          </div>
          <div className="w-10/12 mx-auto">
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
