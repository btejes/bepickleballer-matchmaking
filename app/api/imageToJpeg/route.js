import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

ffmpeg.setFfmpegPath('ffmpeg');

async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.heic`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  const finalOutputPath = path.join(tempDir, `final_output_${Date.now()}.jpg`);
  console.log(`Input path: ${inputPath}`);
  console.log(`Output path: ${outputPath}`);
  console.log(`Final output path: ${finalOutputPath}`);

  await fs.writeFile(inputPath, imageBuffer);
  console.log("Temporary input file created");

  const metadata = await sharp(inputPath).metadata();
  console.log('Image metadata:', metadata);

  let filterComplex = 'scale=800:-1';
  if (metadata.height > metadata.width) {
    console.log("\nVertical .heic found!\n");
    filterComplex = 'transpose=1,' + filterComplex; // Rotate 90 degrees clockwise and scale for vertical images
  }

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-filter_complex', filterComplex,
        '-q:v', '2',
        '-pix_fmt', 'yuvj420p'
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

  console.log("HEIC to JPEG conversion completed");

  // Read the converted image and make it square
  const image = sharp(outputPath).withMetadata(); // Preserve metadata
  const { width, height } = await image.metadata();
  const size = Math.min(width, height);

  await image
    .resize(size, size, {
      fit: sharp.fit.cover,
    })
    .toFile(finalOutputPath);

  console.log("Image resized to square dimensions");

  console.log("Reading converted image");
  const convertedImageBuffer = await fs.readFile(finalOutputPath);
  const base64Image = convertedImageBuffer.toString('base64');
  console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

  await fs.unlink(inputPath);
  await fs.unlink(outputPath);
  await fs.unlink(finalOutputPath);

  console.log("HEIC image processing completed successfully");
  return NextResponse.json({ image: base64Image }, { status: 200 });
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

  await sharp(inputPath)
    .resize(800, 800, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFile(outputPath);

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
      console.log("Unsupported file type");
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.type === 'image/heic') {
      return processHEICImage(file, userId);
    } else {
      return processNormalImage(file, userId);
    }
  } catch (error) {
    console.error('Error during image processing:', error);
    return NextResponse.json({ error: 'Failed to process image', details: error.message }, { status: 500 });
  }
}
