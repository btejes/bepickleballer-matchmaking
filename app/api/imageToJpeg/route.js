import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

ffmpeg.setFfmpegPath('ffmpeg');

const execPromise = util.promisify(exec);

// Function to get dimensions and orientation of HEIC images using exiftool
async function getHEICDimensions(filePath) {
  try {
    const { stdout } = await execPromise(`exiftool -j -ImageWidth -ImageHeight -Orientation "${filePath}"`);
    const metadata = JSON.parse(stdout)[0];
    console.log('Extracted metadata:', metadata);

    let width = metadata.ImageWidth;
    let height = metadata.ImageHeight;
    const orientation = metadata.Orientation;

    console.log(`Raw dimensions: ${width}x${height}, Orientation: ${orientation}`);

    // Swap width and height if the orientation indicates rotation
    if (orientation >= 5 && orientation <= 8) {
      [width, height] = [height, width];
    }

    return {
      width,
      height,
      orientation
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
    const { width, height, orientation } = dimensions;
    console.log(`Corrected dimensions: ${width}x${height}, Orientation: ${orientation}`);
    
    // Handle orientation
    switch (orientation) {
      case 2: filterComplex += 'hflip,'; break;
      case 3: filterComplex += 'rotate=180*PI/180,'; break;
      case 4: filterComplex += 'vflip,'; break;
      case 5: filterComplex += 'transpose=1,vflip,'; break;
      case 6: filterComplex += 'transpose=1,'; break;
      case 7: filterComplex += 'transpose=2,vflip,'; break;
      case 8: filterComplex += 'transpose=2,'; break;
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
