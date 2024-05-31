// src/library/Rating.js

import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  raterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rateeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  honesty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  communication: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  sportsmanship: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  totalStars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RatingSchema.pre('validate', function (next) {
  this.totalStars = ((this.honesty + this.communication + this.sportsmanship) / 3).toFixed(2);
  next();
});

const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export default Rating;
