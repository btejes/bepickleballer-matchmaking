import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import Token from '@/library/Token';
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

  // Create a JSON Web Token for the user
  const jwtToken = jwt.sign({ email: tokenDoc.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Delete the token after verification
  await Token.deleteOne({ token });

  // Redirect to the homepage after successful verification
  const response = NextResponse.redirect(`${process.env.BASE_URL}/homepage`);
  response.cookies.set('token', jwtToken, { httpOnly: true });
  return response;
}
