import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

export async function POST(req) {
  try {
    const jwtToken = cookies().get('token')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;

    const body = await req.json(); // Parse JSON request body
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` }, { status: 400 });
    }

    let imageBuffer = Buffer.from(file.buffer, 'base64');

    // Convert HEIC to JPEG using ffmpeg
    if (file.type === 'image/heic') {
      imageBuffer = await convertHeicToJpeg(imageBuffer);
    }

    // Use sharp to process the image
    const jpegBuffer = await sharp(imageBuffer)
      .resize({ width: 800, height: 800 })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = jpegBuffer.toString('base64');

    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}

async function convertHeicToJpeg(inputBuffer) {
  return new Promise((resolve, reject) => {
    const input = Readable.from(inputBuffer);
    const output = [];

    ffmpeg(input)
      .outputFormat('jpeg')
      .on('data', (chunk) => output.push(chunk))
      .on('end', () => resolve(Buffer.concat(output)))
      .on('error', reject)
      .run();
  });
}