// src/app/api/matchmaking/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Matchmaking from '@/library/Matchmaking';
import Profile from '@/library/Profile';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export const GET = async (req) => {
  await connectToDatabase();

  try {
    const jwtToken = getCookie('token', { req });
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const currentUserProfile = await Profile.findOne({ userId: decoded._id });

    if (!currentUserProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Find potential matches in the same zip code
    const potentialMatches = await Profile.find({
      zipCode: currentUserProfile.zipCode,
      userId: { $ne: decoded._id }, // Exclude current user
    });

    if (potentialMatches.length === 0) {
      return NextResponse.json({ error: 'No matches found' }, { status: 404 });
    }

    // Filter out profiles that have already been decided on
    const matchEntries = await Matchmaking.find({
      user1Id: decoded._id,
    });

    const filteredMatches = potentialMatches.filter((match) => {
      const entry = matchEntries.find(
        (entry) => entry.user2Id.toString() === match.userId.toString()
      );

      if (!entry) {
        return true; // No entry found, include the profile
      }

      // Include profiles where user1 is pending and user2 is either pending or yes
      return entry.user1Decision === 'pending' && ['pending', 'yes'].includes(entry.user2Decision);
    });

    if (filteredMatches.length === 0) {
      return NextResponse.json({ error: 'No matches found' }, { status: 404 });
    }

    const randomMatch = filteredMatches[Math.floor(Math.random() * filteredMatches.length)];
    return NextResponse.json(randomMatch, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export const PUT = async (req) => {
  await connectToDatabase();

  try {
    const jwtToken = getCookie('token', { req });
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { potentialMatchId, userDecision } = await req.json();

    let matchmakingEntry = await Matchmaking.findOne({
      user1Id: decoded._id,
      user2Id: potentialMatchId,
    });

    if (!matchmakingEntry) {
      matchmakingEntry = new Matchmaking({
        user1Id: decoded._id,
        user2Id: potentialMatchId,
        user1Decision: userDecision,
        user2Decision: 'pending',
        matchStatus: 'pending',
        user1DecisionTimestamp: new Date(),
      });
    } else {
      matchmakingEntry.user1Decision = userDecision;
      matchmakingEntry.user1DecisionTimestamp = new Date();
    }

    await matchmakingEntry.save();

    // Check if there is a match
    if (matchmakingEntry.user2Decision === 'yes' && userDecision === 'yes') {
      matchmakingEntry.matchStatus = 'matched';
    }

    await matchmakingEntry.save();

    return NextResponse.json(matchmakingEntry, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
