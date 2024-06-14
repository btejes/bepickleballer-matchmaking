import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Matchmaking from '@/library/Matchmaking';
import Profile from '@/library/Profile';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export const GET = async (req) => {
  await connectToDatabase();

  try {
    const jwtToken = getCookie('token', { req });
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const matchedEntries = await Matchmaking.find({
      $or: [
        { user1Id: decoded._id, user1Decision: 'yes', user2Decision: 'yes' },
        { user2Id: decoded._id, user1Decision: 'yes', user2Decision: 'yes' }
      ]
    });

    if (matchedEntries.length === 0) {
      return NextResponse.json({ error: 
        `Want More Pickleball Matches?\n\n` +
        `Get more matches sooner by sharing bepickleballer.com in your Pickleball Facebook Group or community groups. More shares = More players = More matches for you!\n\n` +
        `Thank you for your support!`
      }, { status: 404 });
    }

    const matchedProfiles = await Promise.all(
      matchedEntries.map(async (entry) => {
        const otherUserId = entry.user1Id.equals(decoded._id) ? entry.user2Id : entry.user1Id;
        const profile = await Profile.findOne({ userId: otherUserId });
        return {
          ...profile.toObject(),
          matchId: entry._id, // Include match ID
          loggedInUserId: decoded._id, // Include logged-in user ID for reference
          user1Id: entry.user1Id,
          user2Id: entry.user2Id
        };
      })
    );

    console.log('Matched profiles with additional data:', matchedProfiles); // Debug log

    return NextResponse.json(matchedProfiles, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
