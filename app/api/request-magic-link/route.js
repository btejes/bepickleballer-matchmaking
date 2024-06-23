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
    user = new User({ email: lowercasedEmail, emailVerified: false, lastVerifiedLogin: "" });
    await user.save();
  } else {
    console.log(`User found for ${lowercasedEmail}`);
  }

  // Check if a valid token exists for this email
  let tokenEntry = await Token.findOne({ email: lowercasedEmail });
  if (tokenEntry && tokenEntry.expires > new Date()) {
    console.log(`Token for ${lowercasedEmail} is still valid. Not sending email.`);
    return NextResponse.json({ message: 'A valid login link has already been sent. Please check your email.' });
  }

  // Create a new token
  const token = nanoid();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  try {
    const baseUrl = process.env.BASE_URL;
    const verifyUrl = `${baseUrl}/redirect?token=${token}`;

    // Send the email
    await sendLoginEmail(lowercasedEmail, verifyUrl);
    console.log(`Sent login email to ${lowercasedEmail} with link ${verifyUrl}`);

    // Save the new token after email is sent
    if (tokenEntry) {
      tokenEntry.token = token;
      tokenEntry.expires = expires;
      await tokenEntry.save();
      console.log(`Updated token for ${lowercasedEmail}`);
    } else {
      await Token.create({ email: lowercasedEmail, token, expires });
      console.log(`Created new token for ${lowercasedEmail}`);
    }

    return NextResponse.json({ message: 'Check your email for the secure login link.' });
  } catch (error) {
    console.error(`Error sending login link to ${lowercasedEmail}:`, error);
    return NextResponse.json({ message: 'Error sending login link.' }, { status: 500 });
  }
}
