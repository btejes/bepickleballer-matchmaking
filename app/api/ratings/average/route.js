import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Rating from '@/library/Rating';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rateeUserId = searchParams.get('rateeUserId');

    console.log("\nrateeUserId inside average route", rateeUserId, "\n");
    
    if (!rateeUserId) {
      throw new Error('Invalid rateeUserId');
    }

    await connectToDatabase();

    const ratings = await Rating.find({ rateeUserId });

    if (ratings.length < 3) {
      return NextResponse.json({ averageRating: 0.0 }, { status: 200 });
    }

    const totalStars = ratings.reduce((acc, rating) => acc + rating.totalStars, 0);
    const averageRating = totalStars / ratings.length;

    return NextResponse.json({ averageRating }, { status: 200 });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    return NextResponse.json({ message: 'Failed to fetch average rating' }, { status: 500 });
  }
}
