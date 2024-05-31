import connectToDatabase from '@/library/connectToDatabase';
import Rating from '@/library/Rating';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rateeUserId = searchParams.get('rateeUserId');

    // Connect to the database
    await connectToDatabase();

    // Fetch all ratings for the user
    const ratings = await Rating.find({ rateeUserId });

    // Return 0.0 if there are fewer than 3 ratings
    if (ratings.length < 3) {
      return new Response(JSON.stringify({ averageRating: 0.0 }), { status: 200 });
    }

    // Calculate the average rating
    const totalStars = ratings.reduce((acc, rating) => acc + rating.totalStars, 0);
    const averageRating = totalStars / ratings.length;

    return new Response(JSON.stringify({ averageRating }), { status: 200 });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch average rating' }), { status: 500 });
  }
}
