// src/app/api/matches/unmatch/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Matchmaking from '@/library/Matchmaking';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export const POST = async (req) => {
  await connectToDatabase();

  try {
    const jwtToken = getCookie('token', { req });
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { matchId } = await req.json();

    // console.log('Request Body:', { matchId });

    if (!decoded._id) {
      return NextResponse.json({ error: 'User ID not found from token' }, { status: 401 });
    }

    const match = await Matchmaking.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user1Id.equals(decoded._id)) {
      match.user1Decision = 'no';
    } else if (match.user2Id.equals(decoded._id)) {
      match.user2Decision = 'no';
    } else {
      return NextResponse.json({ error: 'User not part of this match' }, { status: 400 });
    }

    match.matchStatus = 'unmatched';
    await match.save();

    return NextResponse.json({ message: 'Successfully unmatched' }, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
