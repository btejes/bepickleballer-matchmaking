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
      city: currentUserProfile.city,
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

    // Fetch users who have already said "yes" to the logged-in user
    const yesToCurrentUser = await Matchmaking.find({
      user2Id: decoded._id,
      user2Decision: 'yes',
      user1Decision: { $ne: 'no' },
    });

    const yesUserIds = yesToCurrentUser.map(match => match.user1Id);
    const prioritizedMatches = await Profile.find({ userId: { $in: yesUserIds } });

    // Fetch other potential matches
    const potentialMatches = await Profile.find(query).where('userId').nin(yesUserIds);

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

    console.log("Valid matches found:", validMatches.length);

    // Combine prioritized matches with other valid matches
    const allMatches = [...prioritizedMatches, ...validMatches];

    if (allMatches.length === 0) {
      return NextResponse.json({ error: 'No matches found' }, { status: 404 });
    }

    // Pick a random match from the combined list
    const randomMatch = allMatches[Math.floor(Math.random() * allMatches.length)];
    return NextResponse.json(randomMatch, { status: 200 });
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
