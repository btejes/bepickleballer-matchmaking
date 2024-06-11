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

console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
console.log('AWS_BUCKET_REGION:', process.env.AWS_BUCKET_REGION);

export async function POST() {
  console.log('POST request received');

  try {
    const jwtToken = cookies().get('token')?.value;
    console.log('JWT token:', jwtToken);

    if (!jwtToken) {
      console.log('No JWT token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    console.log('Token verified. User ID:', userId);

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${userId}/${Date.now()}`,
    });

    console.log('PutObjectCommand created:', putObjectCommand);

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    console.log('Signed URL generated:', signedUrl);

    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
