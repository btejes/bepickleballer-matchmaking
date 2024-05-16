// Import necessary modules
import { NextResponse } from 'next/server';
import { sendLoginEmail } from '../../../library/mailgunService';
import { nanoid } from 'nanoid';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// POST handler for /api/request-magic-link
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a unique login link (token-based)
    const token = nanoid();
    const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`;

    // Send the login email using Mailgun
    await sendLoginEmail(email, loginLink);

    // Optionally, store the token in a database with an expiration time

    return NextResponse.json({ message: 'Login link sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending login link:', error);
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 });
  }
}
