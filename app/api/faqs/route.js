// app/api/faqs/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/library/connectToDatabase';

export async function GET() {
  const db = await connectToDatabase();
  const faqsCollection = db.collection('faqs');
  const faqs = await faqsCollection.find({}).toArray();

  return NextResponse.json(faqs);
}
