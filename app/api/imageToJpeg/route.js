import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

ffmpeg.setFfmpegPath('ffmpeg');

async function getImageDimensions(filePath) {
  try {
    console.log(`Getting dimensions for file: ${filePath}`);
    const output = execSync(`exiftool -ImageWidth -ImageHeight -j "${filePath}"`).toString().trim();
    const metadata = JSON.parse(output)[0];
    console.log(`Image dimensions: ${JSON.stringify(metadata)}`);
    return {
      width: metadata.ImageWidth,
      height: metadata.ImageHeight
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    console.log("Starting image processing...");

    // Authorization code (unchanged)
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

    const imageBuffer = Buffer.from(file.buffer, 'base64');
    console.log(`Image buffer size: ${imageBuffer.length} bytes`);

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
    console.log(`Input path: ${inputPath}`);
    console.log(`Output path: ${outputPath}`);

    await fs.writeFile(inputPath, imageBuffer);
    console.log("Temporary input file created");

    let ffmpegCommand = ffmpeg(inputPath);
    let filterComplex = '';

    if (file.type === 'image/heic') {
      console.log("Processing HEIC image");
      const dimensions = await getImageDimensions(inputPath);
      
      if (dimensions) {
        const targetSize = 800;
        const scaleFactor = Math.max(targetSize / dimensions.width, targetSize / dimensions.height);
        const scaledWidth = Math.round(dimensions.width * scaleFactor);
        const scaledHeight = Math.round(dimensions.height * scaleFactor);
        const xOffset = (scaledWidth - targetSize) / 2;
        const yOffset = (scaledHeight - targetSize) / 2;

        filterComplex += `scale=${scaledWidth}:${scaledHeight},crop=${targetSize}:${targetSize}:${xOffset}:${yOffset}`;
      } else {
        console.log("Could not determine image dimensions, using default scaling");
        filterComplex += `scale=800:-1,crop=800:800:0:0`;
      }

      console.log(`Final filter complex for HEIC: ${filterComplex}`);

      ffmpegCommand = ffmpegCommand
        .outputOptions([
          '-filter_complex', filterComplex,
          '-q:v', '2',
          '-pix_fmt', 'yuvj420p'
        ]);
    } else {
      console.log("Processing non-HEIC image");
      ffmpegCommand = ffmpegCommand
        .outputOptions(['-vf', `scale=800:-1,crop=800:800:0:0`]);
    }

    console.log("Starting FFmpeg conversion");
    await new Promise((resolve, reject) => {
      ffmpegCommand.output(outputPath)
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

    console.log("Image processing completed successfully");
    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
