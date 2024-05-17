import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Token from '@/library/Token';
import User from '@/library/User';
const jwt = require('jsonwebtoken');

// Define the API route for verifying a magic login link
export async function GET(request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const tokenDoc = await Token.findOne({ token });

  if (!tokenDoc || tokenDoc.expires < Date.now()) {
    return NextResponse.redirect(`${process.env.BASE_URL}/login`);
  }

  // Retrieve the user's ID based on the email in the token
  const user = await User.findOne({ email: tokenDoc.email });
  if (!user) {
    return NextResponse.redirect(`${process.env.BASE_URL}/login`);
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

  // Store the JSON Web Token in cookies (HTTP-only) for Next.js 14
  const response = NextResponse.redirect(`${process.env.BASE_URL}/homepage`);
  
  // Set cookie options
  const cookieOptions = { httpOnly: true };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  response.cookies.set('token', jwtToken, cookieOptions);
  console.log("\n response.cookies:  ", response.cookies, "\n");

  return response;
}
