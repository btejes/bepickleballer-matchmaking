// library/Preferences.js
import mongoose from 'mongoose';

const PreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  preferredGender: { type: String, required: true },
  preferredAgeRange: { type: String, required: true },
  preferredSkillLevel: { type: String, required: true },
  preferredDUPRRating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Preferences = mongoose.models.Preferences || mongoose.model('Preferences', PreferencesSchema);

export default Preferences;
