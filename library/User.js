// library/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, required: true },
  lastVerifiedLogin: { type: Date }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
