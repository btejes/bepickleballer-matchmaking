import connectToDatabase from '@/library/connectToDatabase';
import Rating from '@/library/Rating';

export async function POST(req) {
  try {
    const { raterUserId, rateeUserId, honesty, communication, sportsmanship } = await req.json();

    // Connect to the database
    await connectToDatabase();

    // Calculate totalStars
    const totalStars = (honesty + communication + sportsmanship) / 3;

    // Create a new rating
    const rating = new Rating({
      raterUserId, // Ensure raterUserId is included
      rateeUserId,
      honesty,
      communication,
      sportsmanship,
      totalStars,
      createdAt: new Date(),
    });

    await rating.save();

    return new Response(JSON.stringify({ message: 'Rating submitted successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return new Response(JSON.stringify({ message: 'Failed to submit rating' }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rateeUserId = searchParams.get('rateeUserId');
    const raterUserId = searchParams.get('raterUserId'); // Ensure raterUserId is retrieved

    // Connect to the database
    await connectToDatabase();

    // Fetch the existing rating
    const rating = await Rating.findOne({ rateeUserId, raterUserId }); // Ensure both user IDs are used in the query

    if (!rating) {
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify(rating), { status: 200 });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch rating' }), { status: 500 });
  }
}
