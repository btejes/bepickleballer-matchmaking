// src/app/api/preferences/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Preferences from '@/library/Preferences';
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
    const preferences = await Preferences.findOne({ userId: decoded._id });

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
    }

    return NextResponse.json(preferences, { status: 200 });
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
    const updatedData = await req.json();

    const preferences = await Preferences.findOneAndUpdate(
      { userId: decoded._id },
      updatedData,
      { new: true }
    );

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
    }

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
