import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';

async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.heic`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  console.log(`Input path: ${inputPath}`);
  console.log(`Output path: ${outputPath}`);

  try {
    await fs.writeFile(inputPath, imageBuffer);
    console.log("Temporary input file created");

    const metadata = await sharp(inputPath).metadata();
    console.log('Image metadata:', metadata);

    let rotateOption = '';
    if (metadata.height > metadata.width) {
      rotateOption = '-vf "transpose=1"'; // Rotate 90 degrees clockwise for vertical images
    }

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${inputPath} ${rotateOption} -vf "scale=800:-1" ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error during HEIC to JPEG conversion:', stderr);
          return reject(new Error('Failed to convert HEIC to JPEG'));
        }
        console.log('FFmpeg conversion stdout:', stdout);
        resolve();
      });
    });

    console.log("HEIC to JPEG conversion completed");

    console.log("Reading converted image");
    const convertedImageBuffer = await fs.readFile(outputPath);
    const base64Image = convertedImageBuffer.toString('base64');
    console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];

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
