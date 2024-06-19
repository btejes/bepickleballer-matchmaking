import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Matchmaking from '@/library/Matchmaking';
import Profile from '@/library/Profile';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  await connectToDatabase();
  console.log("Connected to database.");

  try {
    const jwtToken = cookies().get('token')?.value;
    console.log("JWT Token:", jwtToken);
    if (!jwtToken) {
      console.log("No JWT Token found.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    console.log("Token Verified:", decoded);
    const currentUserProfile = await Profile.findOne({ userId: decoded._id });

    if (!currentUserProfile) {
      console.log("Profile not found for user:", decoded._id);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const filters = await request.json();
    console.log("Filters received:", filters);

    const query = {
      city: currentUserProfile.city,  // Ensures city requirement
      userId: { $ne: decoded._id },
      profileImage: { $exists: true, $ne: null, $ne: '' },
      firstName: { $exists: true, $ne: null, $ne: '' },
      gender: { $exists: true, $ne: null, $ne: '' },
      ageRange: { $exists: true, $ne: null, $ne: '' },
      skillLevel: { $exists: true, $ne: null, $ne: '' },
      aboutYou: { $exists: true, $ne: null, $ne: '' },
      openForMatches: { $ne: "no", $ne: '' }
    };

    if (filters.preferredGender) {
      query.gender = filters.preferredGender;
    }

    if (filters.preferredAgeRange) {
      const [minAge, maxAge] = filters.preferredAgeRange.split('-').map(Number);
      query.ageRange = { $gte: minAge, $lte: maxAge };
    }

    if (filters.preferredSkillLevel) {
      query.skillLevel = filters.preferredSkillLevel;
    }

    if (filters.preferredDUPRRating) {
      query.duprRating = { $gte: parseFloat(filters.preferredDUPRRating) };
    }

    console.log("Query built:", query);

    const potentialMatches = await Profile.find(query);

    const pendingMatches = [];
    const randomMatches = [];

    for (const match of potentialMatches) {
      const existingEntry = await Matchmaking.findOne({
        $or: [
          { user1Id: decoded._id, user2Id: match.userId },
          { user1Id: match.userId, user2Id: decoded._id },
        ],
      });

      if (existingEntry) {
        // Check if the logged-in user is user1
        if (existingEntry.user1Id.equals(decoded._id)) {
          if (existingEntry.user1Decision === 'pending' && existingEntry.user2Decision === 'yes') {
            pendingMatches.push(match);
          } else if (
            existingEntry.user1Decision === 'yes' &&
            existingEntry.user2Decision === 'pending'
          ) {
            // This match is pending for the other user
            continue;
          } else if (
            existingEntry.user1Decision === 'yes' &&
            existingEntry.user2Decision === 'yes'
          ) {
            // Both users have said "yes", skip these matches
            continue;
          } else if (existingEntry.user2Decision === 'no') {
            // Skip if the other user has said "no"
            continue;
          } else {
            randomMatches.push(match);
          }
        } 
        // Check if the logged-in user is user2
        else if (existingEntry.user2Id.equals(decoded._id)) {
          if (existingEntry.user2Decision === 'pending' && existingEntry.user1Decision === 'yes') {
            pendingMatches.push(match);
          } else if (
            existingEntry.user2Decision === 'yes' &&
            existingEntry.user1Decision === 'pending'
          ) {
            // This match is pending for the other user
            continue;
          } else if (
            existingEntry.user1Decision === 'yes' &&
            existingEntry.user2Decision === 'yes'
          ) {
            // Both users have said "yes", skip these matches
            continue;
          } else if (existingEntry.user1Decision === 'no') {
            // Skip if the other user has said "no"
            continue;
          } else {
            randomMatches.push(match);
          }
        }
      } else {
        randomMatches.push(match);
      }
    }

    console.log("Pending matches found:", pendingMatches.length);
    console.log("Random matches found:", randomMatches.length);

    if (pendingMatches.length > 0) {
      // Always return the first pending match until the user interacts with it
      const pendingMatch = pendingMatches[0];
      return NextResponse.json(pendingMatch, { status: 200 });
    } else if (randomMatches.length > 0) {
      // No pending matches, fallback to random matches
      const randomMatch = randomMatches[Math.floor(Math.random() * randomMatches.length)];
      return NextResponse.json(randomMatch, { status: 200 });
    } else {
      // No matches found
      return NextResponse.json({ error: 'No matches found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}






export async function PUT(request) {
  await connectToDatabase();
  console.log("Connected to database for PUT request.");

  try {
    const jwtToken = cookies().get('token')?.value;
    console.log("JWT Token for PUT:", jwtToken);
    if (!jwtToken) {
      console.log("No JWT Token found for PUT.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { potentialMatchId, userDecision } = await request.json();
    console.log("Decoded token for PUT:", decoded, "Potential Match ID:", potentialMatchId, "User Decision:", userDecision);

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
      console.log("New matchmaking entry created:", matchmakingEntry);
    } else {
      if (matchmakingEntry.user1Id.equals(decoded._id)) {
        matchmakingEntry.user1Decision = userDecision;
        matchmakingEntry.user1DecisionTimestamp = new Date();
      } else {
        matchmakingEntry.user2Decision = userDecision;
        matchmakingEntry.user2DecisionTimestamp = new Date();
      }
      console.log("Updated existing matchmaking entry:", matchmakingEntry);
    }

    if (matchmakingEntry.user1Decision === 'yes' && matchmakingEntry.user2Decision === 'yes') {
      matchmakingEntry.matchStatus = 'matched';
    } else if (matchmakingEntry.user1Decision === 'no' || matchmakingEntry.user2Decision === 'no') {
      matchmakingEntry.matchStatus = 'rejected';
    }

    await matchmakingEntry.save();
    console.log("Matchmaking entry saved.");
    return NextResponse.json(matchmakingEntry, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error in PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
