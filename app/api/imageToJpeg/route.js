import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import decode from 'heic-decode';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath('ffmpeg');


async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  try {
    // Get HEIC dimensions using heic-decode
    let width, height;
    try {
      const result = await decode({ buffer: imageBuffer });
      width = result.width;
      height = result.height;
      console.log(`HEIC Dimensions: ${width}x${height}`);
    } catch (decodeError) {
      console.error('Error decoding HEIC:', decodeError);
      throw new Error('Failed to decode HEIC image');
    }

    const isVertical = height > width;

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(imageBuffer);
    readableStream.push(null);

    // Process the image using FFmpeg
    const outputBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      let ffmpegCommand = ffmpeg(readableStream)
        .inputFormat('heic')
        .outputOptions([
          '-qscale:v', '2',
          '-pix_fmt', 'yuvj420p',  // Preserve full color range
          '-vf', `scale=${isVertical ? '800:-1' : '-1:800'}:force_original_aspect_ratio=decrease`
        ])
        .toFormat('jpeg')
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('data', chunk => chunks.push(chunk));

      ffmpegCommand.pipe();
    });

    console.log(`Converted image size: ${outputBuffer.length} bytes`);
    const base64Image = outputBuffer.toString('base64');

    console.log("HEIC image processing completed successfully");
    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error during HEIC processing:', error);
    return NextResponse.json({ error: 'Failed to process HEIC image', details: error.message }, { status: 500 });
  }
}

// Function to process normal images
async function processNormalImage(file, userId) {
  console.log("Processing normal image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  console.log(`Input path: ${inputPath}`);
  console.log(`Output path: ${outputPath}`);

  await fs.writeFile(inputPath, imageBuffer);
  console.log("Temporary input file created");

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-vf', 'scale=800:800:force_original_aspect_ratio=decrease',
        '-pix_fmt', 'yuvj420p',
        '-vf', 'colorlevels=rimin=0:gimin=0:bimin=0'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('FFmpeg process completed');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during FFmpeg process:', err);
        reject(err);
      })
      .run();
  });

  console.log("Reading converted image");
  const convertedImageBuffer = await fs.readFile(outputPath);
  const base64Image = convertedImageBuffer.toString('base64');
  console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

  console.log("Cleaning up temporary files");
  await fs.unlink(inputPath);
  await fs.unlink(outputPath);

  console.log("Normal image processing completed successfully");
  return NextResponse.json({ image: base64Image }, { status: 200 });
}

export async function POST(req) {
  try {
    console.log("Starting image processing...");

    // Authorization code
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    console.log(`Processing request for user: ${userId}`);

    const body = await req.json();
    const { file } = body;

    if (!file) {
      console.log("No file uploaded");
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`File type: ${file.type}`);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`Unsupported file type: ${file.type}`);
      return NextResponse.json({ error: `${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` }, { status: 400 });
    }

    if (file.type === 'image/heic') {
      return await processHEICImage(file, userId);
    } else {
      return await processNormalImage(file, userId);
    }
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
