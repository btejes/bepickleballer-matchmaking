import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Token from '@/library/Token';
import User from '@/library/User';
import Profile from '@/library/Profile';
const jwt = require('jsonwebtoken');

// Define the API route for verifying a magic login link
export async function GET(request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const tokenDoc = await Token.findOne({ token });
  const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  

  if (!tokenDoc || tokenDoc.expires < Date.now()) {
    return NextResponse.redirect(`${process.env.BASE_URL}${apiBasePath}`);
  }

  // Retrieve the user's ID based on the email in the token
  const user = await User.findOne({ email: tokenDoc.email });
  if (!user) {
    return NextResponse.redirect(`${process.env.BASE_URL}${apiBasePath}`);
  }

  // Check if a profile exists for this user, and create one if it does not exist
  let profile = await Profile.findOne({ userId: user._id });
  if (!profile) {
    console.log(`Profile not found for user ${tokenDoc.email}. Creating default profile.`);
    profile = new Profile({ userId: user._id });
    await profile.save();
  }

  // Create a JSON Web Token for the user, storing the user's ID
  const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
  console.log("\njwtToken: ", jwtToken, "\n");

  // Delete the token after verification
  await Token.deleteOne({ token });

  // Update the user's emailVerified and lastVerifiedLogin fields
  if (!user.emailVerified) {
    user.emailVerified = true;
  }
  user.lastVerifiedLogin = new Date();
  await user.save();

  // Redirect user to the homepage with the JWT set in a secure, HttpOnly cookie
  const response = NextResponse.redirect(`${process.env.BASE_URL}${apiBasePath}/homepage`);
  response.cookies.set('token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    domain: 'bepickleballer.com'  // Ensure cookie is available across all subdomains
  });

  return response;
}
