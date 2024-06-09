import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Matchmaking from '@/library/Matchmaking';
import Profile from '@/library/Profile';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  await connectToDatabase();

  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const currentUserProfile = await Profile.findOne({ userId: decoded._id });

    if (!currentUserProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const potentialMatches = await Profile.find({
      zipCode: currentUserProfile.zipCode,
      userId: { $ne: decoded._id },
    });

    const validMatches = [];
    for (const match of potentialMatches) {
      const existingEntry = await Matchmaking.findOne({
        $or: [
          { user1Id: decoded._id, user2Id: match.userId },
          { user1Id: match.userId, user2Id: decoded._id },
        ],
      });

      if (!existingEntry ||
          (existingEntry.user1Id.equals(decoded._id) && existingEntry.user1Decision === 'pending' && existingEntry.user2Decision !== 'no') ||
          (existingEntry.user2Id.equals(decoded._id) && existingEntry.user2Decision === 'pending' && existingEntry.user1Decision !== 'no')) {
        validMatches.push(match);
      }
    }

    if (validMatches.length === 0) {
      console.log("\nNo validMatches found\n");
      return NextResponse.json({ error: 'No matches found' }, { status: 404 });
    }

    const randomMatch = validMatches[Math.floor(Math.random() * validMatches.length)];
    return NextResponse.json(randomMatch, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  await connectToDatabase();

  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { potentialMatchId, userDecision } = await request.json();

    let matchmakingEntry = await Matchmaking.findOne({
      $or: [
        { user1Id: decoded._id, user2Id: potentialMatchId },
        { user1Id: potentialMatchId, user2Id: decoded._id },
      ],
    });

    if (!matchmakingEntry) {
      matchmakingEntry = new Matchmaking({
        user1Id: decoded._id,
        user2Id: potentialMatchId,
        user1Decision: userDecision,
        user2Decision: 'pending',
        user1DecisionTimestamp: new Date(),
        user2DecisionTimestamp: null,
        matchStatus: 'pending',
      });
    } else {
      if (matchmakingEntry.user1Id.equals(decoded._id)) {
        matchmakingEntry.user1Decision = userDecision;
        matchmakingEntry.user1DecisionTimestamp = new Date();
      } else {
        matchmakingEntry.user2Decision = userDecision;
        matchmakingEntry.user2DecisionTimestamp = new Date();
      }
    }

    if (matchmakingEntry.user1Decision === 'yes' && matchmakingEntry.user2Decision === 'yes') {
      matchmakingEntry.matchStatus = 'matched';
    } else if (matchmakingEntry.user1Decision === 'no' || matchmakingEntry.user2Decision === 'no') {
      matchmakingEntry.matchStatus = 'rejected';
    }

    await matchmakingEntry.save();

    return NextResponse.json(matchmakingEntry, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
