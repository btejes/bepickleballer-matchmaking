import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Rating from '@/library/Rating';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const cacheControlHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

export async function GET(request) {
  await connectToDatabase();

  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      // console.log("\nNo jwt found in average rating api\n");
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: cacheControlHeaders,
      });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const rateeUserId = decoded._id;

    // console.log("\nrateeUserId inside average route", rateeUserId, "\n");

    if (!rateeUserId) {
      throw new Error('Invalid rateeUserId');
    }

    const ratings = await Rating.find({ rateeUserId });

    if (ratings.length < 3) {
      return new NextResponse(JSON.stringify({ averageRating: 0.0 }), {
        status: 200,
        headers: cacheControlHeaders,
      });
    }

    const totalStars = ratings.reduce((acc, rating) => acc + rating.totalStars, 0);
    const averageRating = totalStars / ratings.length;

    return new NextResponse(JSON.stringify({ averageRating }), {
      status: 200,
      headers: cacheControlHeaders,
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch average rating' }), {
      status: 500,
      headers: cacheControlHeaders,
    });
  }
}
