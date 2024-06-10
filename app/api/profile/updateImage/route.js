import { connectToDatabase } from '../../../library/connectToDatabase';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  const token = getCookie('jwt', { req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, profileImage } = await req.json();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { profileImage } }
    );

    return NextResponse.json({ message: 'Profile image updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json({ error: 'Error updating profile image' }, { status: 500 });
  }
}