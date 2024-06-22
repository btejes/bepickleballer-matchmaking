import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

ffmpeg.setFfmpegPath('ffmpeg');

// Function to get dimensions and rotation of HEIC images using ffmpeg
async function getHEICDimensions(filePath) {
  try {
    const output = execSync(`ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=width,height,rotation -of json "${filePath}"`).toString().trim();
    const metadata = JSON.parse(output);
    const stream = metadata.streams[0];
    return {
      width: stream.width,
      height: stream.height,
      rotation: stream.tags && stream.tags.rotation ? parseInt(stream.tags.rotation) : 0
    };
  } catch (error) {
    console.error('Error getting HEIC image dimensions:', error);
    return null;
  }
}

// Function to process HEIC images
async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.heic`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  console.log(`Input path: ${inputPath}`);
  console.log(`Output path: ${outputPath}`);

  await fs.writeFile(inputPath, imageBuffer);
  console.log("Temporary input file created");

  const dimensions = await getHEICDimensions(inputPath);
  
  let filterComplex = '';
  if (dimensions) {
    const { width, height, rotation } = dimensions;
    console.log(`Image dimensions: ${width}x${height}, Rotation: ${rotation}`);
    
    // Handle rotation
    if (rotation === 90 || rotation === 270) {
      console.log("Applying transpose to correct rotation");
      filterComplex += `transpose=${rotation === 90 ? '1' : '2'},`;
    } else if (rotation === 180) {
      console.log("Applying 180-degree rotation");
      filterComplex += 'hflip,vflip,';
    }
  } else {
    console.log("Could not determine image dimensions, proceeding without orientation check");
  }

  filterComplex += 'scale=800:800:force_original_aspect_ratio=decrease';
  console.log(`Final filter complex for HEIC: ${filterComplex}`);

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

  console.log("Reading converted image");
  const convertedImageBuffer = await fs.readFile(outputPath);
  const base64Image = convertedImageBuffer.toString('base64');
  console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

  console.log("Cleaning up temporary files");
  await fs.unlink(inputPath);
  await fs.unlink(outputPath);

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

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-vf', 'scale=800:800:force_original_aspect_ratio=decrease'])
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
