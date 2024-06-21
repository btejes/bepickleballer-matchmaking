import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, default: '' },
  gender: { type: String, default: '' },
  ageRange: { type: String, default: '' },
  duprRating: { type: String, default: '' },
  skillLevel: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  city: { type: String, default: '' },
  openForMatches: { type: String, default: '' },
  aboutYou: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },  
  profileImage: { type: String, default: '' },
  casualCompetitive: { type: String, default: '' }, 
  outdoorIndoor: { type: String, default: '' },
  rightieLeftie: { type: String, default: '' } 
});

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
