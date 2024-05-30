// library/Matchmaking.js
import mongoose from 'mongoose';

const MatchmakingSchema = new mongoose.Schema({
  user1Id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  user2Id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  user1Decision: { type: String, enum: ['yes', 'no', 'pending'], default: 'pending' },
  user2Decision: { type: String, enum: ['yes', 'no', 'pending'], default: 'pending' },
  user1DecisionTimestamp: { type: Date },
  user2DecisionTimestamp: { type: Date },
  matchStatus: { type: String, enum: ['pending', 'matched', 'rejected', 'unmatched'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Matchmaking = mongoose.models.Matchmaking || mongoose.model('Matchmaking', MatchmakingSchema);

export default Matchmaking;
