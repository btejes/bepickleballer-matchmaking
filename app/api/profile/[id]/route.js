import connectToDatabase from '@/library/connectToDatabase';
import Profile from '@/library/Profile';

export const GET = async (req, { params }) => {
  await connectToDatabase();

  try {
    const profile = await Profile.findById(params.id);
    if (!profile) {
      return new Response('Profile not found', { status: 404 });
    }
    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const PUT = async (req, { params }) => {
  await connectToDatabase();
  const updatedData = await req.json();

  try {
    const profile = await Profile.findByIdAndUpdate(params.id, updatedData, { new: true });
    if (!profile) {
      return new Response('Profile not found', { status: 404 });
    }
    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};
