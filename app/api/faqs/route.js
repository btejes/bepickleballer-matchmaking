import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('BASE_URL:', process.env.BASE_URL);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  await connectToDatabase();

  try {
    const db = mongoose.connection.db;
    const faqsCollection = db.collection('faqs');
    const faqs = await faqsCollection.find({}).toArray();

    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ message: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
