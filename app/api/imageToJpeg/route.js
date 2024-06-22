import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath('ffmpeg');

const execPromise = util.promisify(exec);

// Function to get dimensions and rotation of HEIC images using ffprobe
async function getHEICDimensions(filePath) {
  try {
    const { stdout } = await execPromise(`ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=width,height,side_data_list -of json "${filePath}"`);
    const metadata = JSON.parse(stdout);
    console.log('Extracted metadata:', metadata);

    const stream = metadata.streams[0];
    let width = stream.width;
    let height = stream.height;
    let rotation = 0;

    // Check for rotation in side_data_list
    if (stream.side_data_list && stream.side_data_list.length > 0) {
      const rotationData = stream.side_data_list.find(data => data.side_data_type === 'Display Matrix');
      if (rotationData) {
        // Extract rotation from the display matrix
        const matrix = rotationData.displaymatrix;
        if (matrix[0] === 0 && matrix[4] === 0) {
          rotation = (matrix[1] === 1 && matrix[3] === -1) ? 90 : 270;
        } else if (matrix[0] === -1 && matrix[4] === -1) {
          rotation = 180;
        }
      }
    }

    console.log(`Raw dimensions: ${width}x${height}, Rotation: ${rotation}`);

    // Swap width and height if rotated 90 or 270 degrees
    if (rotation === 90 || rotation === 270) {
      [width, height] = [height, width];
    }

    return { width, height, rotation };
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
    console.log(`Corrected dimensions: ${width}x${height}, Rotation: ${rotation}`);
    
    // Handle rotation
    if (rotation === 90) {
      filterComplex += 'transpose=1,';
    } else if (rotation === 180) {
      filterComplex += 'transpose=2,transpose=2,';
    } else if (rotation === 270) {
      filterComplex += 'transpose=2,';
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
