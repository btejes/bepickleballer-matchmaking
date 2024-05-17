// library/Token.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true }
});

const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);

export default Token;
