import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

ffmpeg.setFfmpegPath('ffmpeg');

async function getImageDimensions(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Error getting image dimensions:', err);
        reject(err);
      } else {
        const { width, height } = metadata.streams[0];
        console.log(`Image dimensions: ${width}x${height}`);
        resolve({ width, height });
      }
    });
  });
}

async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.heic`);
  const pngPath = path.join(tempDir, `intermediate_${Date.now()}.png`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  console.log(`Input path: ${inputPath}`);
  console.log(`PNG path: ${pngPath}`);
  console.log(`Output path: ${outputPath}`);

  try {
    await fs.writeFile(inputPath, imageBuffer);
    console.log("Temporary input file created");

    const dimensions = await getImageDimensions(inputPath);
    const isVertical = dimensions.height > dimensions.width;

    // Step 1: Convert HEIC to PNG
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-vf', 'format=rgba'])
        .output(pngPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started (HEIC to PNG):', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing (HEIC to PNG): ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('HEIC to PNG conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error (HEIC to PNG):', err);
          reject(err);
        })
        .run();
    });

    // Step 2: Convert PNG to JPEG
    await new Promise((resolve, reject) => {
      let filterComplex = isVertical ? 'transpose=1,' : '';
      filterComplex += 'scale=800:800:force_original_aspect_ratio=decrease';

      ffmpeg(pngPath)
        .outputOptions([
          '-filter_complex', filterComplex,
          '-q:v', '2',
          '-pix_fmt', 'yuv420p'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started (PNG to JPEG):', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing (PNG to JPEG): ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('PNG to JPEG conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error (PNG to JPEG):', err);
          reject(err);
        })
        .run();
    });

    console.log("Reading converted image");
    const convertedImageBuffer = await fs.readFile(outputPath);
    const base64Image = convertedImageBuffer.toString('base64');
    console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

    await fs.unlink(inputPath);
    await fs.unlink(pngPath);
    await fs.unlink(outputPath);

    console.log("HEIC image processing completed successfully");
    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error during HEIC processing:', error);
    return NextResponse.json({ error: 'Failed to process HEIC image' }, { status: 500 });
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
