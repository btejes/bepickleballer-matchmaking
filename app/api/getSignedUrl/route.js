import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST() {
  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${userId}/${Date.now()}`,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
