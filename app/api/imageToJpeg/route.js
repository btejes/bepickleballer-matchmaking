import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/library/connectToDatabase';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const jwtToken = cookies().get('token')?.value;

    if (!jwtToken) {
      console.log('No JWT token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;

    await connectToDatabase();

    const { file } = await req.json(); // Parse JSON request body
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`File type ${file.type} not accepted`);
      return NextResponse.json({ error: `${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` }, { status: 400 });
    }

    const imageBuffer = Buffer.from(file.buffer, 'base64');
    const jpegBuffer = await sharp(imageBuffer)
      .resize({ width: 800, height: 800 })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${userId}/${Date.now()}.jpeg`,
      Body: jpegBuffer,
      ContentType: 'image/jpeg',
    };

    const putObjectCommand = new PutObjectCommand(params);
    await s3Client.send(putObjectCommand);

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${userId}/${Date.now()}.jpeg`;

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
