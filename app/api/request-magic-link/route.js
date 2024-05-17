import { NextResponse } from 'next/server';
import { sendLoginEmail } from '@/library/mailgunService';
import { nanoid } from 'nanoid';
import connectToDatabase from '@/library/connectToDatabase';
import Token from '@/library/Token';
import User from '@/library/User';

export async function POST(request) {
  await connectToDatabase();

  const { email } = await request.json();
  const lowercasedEmail = email.toLowerCase();

  console.log(`Received request to send magic link to ${lowercasedEmail}`);

  // Check if user exists, if not, create one
  let user = await User.findOne({ email: lowercasedEmail });
  if (!user) {
    console.log(`User not found. Creating new user for ${lowercasedEmail}`);
    // let currentDate = new Date().getTime();
    user = new User({ email: lowercasedEmail,  emailVerified: false, lastVerifiedLogin: "" });
    await user.save();
  } else {
    console.log(`User found for ${lowercasedEmail}`);
  }

  // Check if a token exists for this email
  let tokenEntry = await Token.findOne({ email: lowercasedEmail });
  let token;
  if (tokenEntry) {
    // If the token entry exists, check if it has expired
    if (tokenEntry.expires > new Date()) {
      console.log(`Token for ${lowercasedEmail} is still valid. Not sending email.`);
      return NextResponse.json({ message: 'A valid login link has already been sent. Please check your email.' });
    } else {
      // If the token has expired, update it with a new token and expiry time
      tokenEntry.token = nanoid();
      tokenEntry.expires = new Date(Date.now() + 15 * 60 * 1000);
      await tokenEntry.save();
      console.log(`Updated expired token for ${lowercasedEmail}`);
    }
  } else {
    // If no token entry exists, create a new one
    token = nanoid();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await Token.create({ email: lowercasedEmail, token, expires });
    console.log(`Created new token for ${lowercasedEmail}`);
  }

  // Construct the URL for the magic link
  const baseUrl = process.env.BASE_URL;
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${tokenEntry ? tokenEntry.token : token}`;

  try {
    // Send the login email using the Mailgun service
    await sendLoginEmail(lowercasedEmail, verifyUrl);
    console.log(`Sent login email to ${lowercasedEmail} with link ${verifyUrl}`);
    return NextResponse.json({ message: 'Check your email for the secure login link.' });
  } catch (error) {
    console.error(`Error sending login link to ${lowercasedEmail}:`, error);
    return NextResponse.json({ message: 'Error sending login link.' }, { status: 500 });
  }
}
