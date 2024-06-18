import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/library/connectToDatabase';
import Profile from '@/library/Profile';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST() {
  try {
    console.log('POST request received');
    const jwtToken = cookies().get('token')?.value;
    console.log('JWT token:', jwtToken);

    if (!jwtToken) {
      console.log('No JWT token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    console.log('Token verified. User ID:', userId);

    await connectToDatabase();

    // List all objects in the user's folder
    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `${userId}/`,
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const listResponse = await s3Client.send(listCommand);

    // Delete all objects found in the folder
    if (listResponse.Contents) {
      const deletePromises = listResponse.Contents.map((object) => {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: object.Key,
        };
        return s3Client.send(new DeleteObjectCommand(deleteParams));
      });

      await Promise.all(deletePromises);
      console.log("Deleted old images");
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${userId}/${Date.now()}.jpeg`,
      ContentType: 'image/jpeg',
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
