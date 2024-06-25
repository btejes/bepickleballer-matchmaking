import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Profile from '@/library/Profile';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const cacheControlHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

export async function GET() {
  await connectToDatabase();

  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      // console.log("\nNo jwt found in profile api\n");
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: cacheControlHeaders,
      });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const profile = await Profile.findOne({ userId: decoded._id });

    // console.log("\nProfile Found: ", profile, "\n");
    if (!profile) {
      return new NextResponse(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: cacheControlHeaders,
      });
    }

    return new NextResponse(JSON.stringify(profile), {
      status: 200,
      headers: cacheControlHeaders,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: cacheControlHeaders,
    });
  }
}



export async function PUT(request) {
  await connectToDatabase();

  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: cacheControlHeaders,
      });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const updatedData = await request.json();


    const profile = await Profile.findOneAndUpdate(
      { userId: decoded._id },
      updatedData,
      { new: true }
    );

    if (!profile) {
      return new NextResponse(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: cacheControlHeaders,
      });
    }

    return new NextResponse(JSON.stringify(profile), {
      status: 200,
      headers: cacheControlHeaders,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: cacheControlHeaders,
    });
  }
}
