import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

ffmpeg.setFfmpegPath('ffmpeg');

import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

async function getHEICDimensions(filePath) {
  try {
    const { stdout } = await execPromise(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
    const metadata = JSON.parse(stdout);
    
    // Find the video stream with the largest dimensions
    const videoStreams = metadata.streams.filter(stream => stream.codec_type === 'video');
    const mainStream = videoStreams.reduce((largest, current) => {
      const largestArea = largest.width * largest.height;
      const currentArea = current.width * current.height;
      return currentArea > largestArea ? current : largest;
    });

    console.log(`HEIC Dimensions: ${mainStream.width}x${mainStream.height}`);
    return {
      width: mainStream.width,
      height: mainStream.height,
      rotation: mainStream.tags && mainStream.tags.rotate ? parseInt(mainStream.tags.rotate) : 0
    };
  } catch (error) {
    console.error('Error getting HEIC dimensions:', error);
    throw error;
  }
}

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

    const { width, height, rotation } = await getHEICDimensions(inputPath);
    console.log(`Image dimensions: ${width}x${height}, Rotation: ${rotation} degrees`);

    const isVertical = height > width;

    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputPath)
        .inputOptions(['-c:v', 'hevc'])
        .outputOptions([
          '-qscale:v', '2',
          '-pix_fmt', 'yuvj420p'  // Preserve full color range
        ]);

      // Handle rotation
      if (isVertical && rotation === 0) {
        ffmpegCommand = ffmpegCommand.videoFilters('transpose=1');  // Rotate 90 degrees clockwise
      } else if (rotation === 90) {
        ffmpegCommand = ffmpegCommand.videoFilters('transpose=2');  // Rotate 90 degrees counterclockwise
      } else if (rotation === 180) {
        ffmpegCommand = ffmpegCommand.videoFilters('transpose=2,transpose=2');  // Rotate 180 degrees
      } else if (rotation === 270) {
        ffmpegCommand = ffmpegCommand.videoFilters('transpose=1');  // Rotate 90 degrees clockwise
      }

      // Apply scaling
      ffmpegCommand = ffmpegCommand.videoFilters('scale=800:800:force_original_aspect_ratio=decrease');

      ffmpegCommand
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('HEIC to JPEG conversion completed');
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg error:', err);
          console.error('FFmpeg stdout:', stdout);
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        })
        .run();
    });

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
