import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Token from '@/library/Token';
import User from '@/library/User';
import Profile from '@/library/Profile';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const tokenDoc = await Token.findOne({ token });
  const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const baseUrl = process.env.BASE_URL || '';

  if (!tokenDoc || tokenDoc.expires < Date.now()) {
    console.log("\nExpired token or no token doc found, routing to login\n");
    return NextResponse.redirect(new URL(apiBasePath, baseUrl));
  }

  const user = await User.findOne({ email: tokenDoc.email });
  if (!user) {
    console.log("\nNo user found, routing to login\n");
    return NextResponse.redirect(new URL(apiBasePath, baseUrl));
  }

  let profile = await Profile.findOne({ userId: user._id });
  if (!profile) {
    console.log(`Profile not found for user ${tokenDoc.email}. Creating default profile.`);
    profile = new Profile({ userId: user._id });
    await profile.save();
  }

  const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
  console.log("\njwtToken: ", jwtToken, "\n");

  await Token.deleteOne({ token });
  console.log("\nOld auth token deleted from token collection DB\n");

  if (!user.emailVerified) {
    user.emailVerified = true;
  }
  user.lastVerifiedLogin = new Date();
  await user.save();

  const response = NextResponse.redirect(new URL(`${apiBasePath}/homepage`, baseUrl));
  response.cookies.set('token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None', // Important for cross-site access
    path: '/matchmaking',
    domain: 'bepickleballer.com'  // Ensure cookie is available across all subdomains
  });

  console.log("\nReturning response from auth verify API: ", response, "\n");

  return response;
}
