import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  gender: { type: String, default: '' },
  ageRange: { type: String, default: '' },
  duprRating: { type: String, default: '' },
  skillLevel: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  openForMatches: { type: String, default: '' },
  aboutYou: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  profileImage: { type: String, default: '' },
});

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
