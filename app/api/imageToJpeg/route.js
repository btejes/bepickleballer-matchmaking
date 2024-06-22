import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// On Heroku, ffmpeg should be available in the PATH due to the buildpack
ffmpeg.setFfmpegPath('ffmpeg');

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
    console.log("\nfile type:", file.type, "\n");
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      console.log("\nfile type:", file.type, "\n");
      return NextResponse.json({ error: `${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` }, { status: 400 });
    }

    const imageBuffer = Buffer.from(file.buffer, 'base64');

    // Create temporary input and output files
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

    await fs.writeFile(inputPath, imageBuffer);

    // Use FFmpeg to convert the image
    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputPath);
      
      if (file.type === 'image/heic') {
        // For HEIC images, we'll use a two-step process
        const tempOutputPath = path.join(tempDir, `temp_output_${Date.now()}.jpg`);
        
        // Step 1: Convert HEIC to JPEG without any transformations
        ffmpegCommand
          .inputOptions(['-vsync', '0'])
          .output(tempOutputPath)
          .on('end', () => {
            // Step 2: Get the orientation of the converted image and apply appropriate scaling
            ffmpeg.ffprobe(tempOutputPath, (err, metadata) => {
              if (err) {
                reject(err);
                return;
              }
              
              const width = metadata.streams[0].width;
              const height = metadata.streams[0].height;
              const isLandscape = width > height;
              
              ffmpeg(tempOutputPath)
                .outputOptions([
                  '-vf', `scale=${isLandscape ? '800:-1' : '-1:800'}:force_original_aspect_ratio=decrease`,
                  '-metadata:s:v', 'rotate=0'
                ])
                .output(outputPath)
                .on('end', () => {
                  fs.unlink(tempOutputPath).then(resolve).catch(reject);
                })
                .on('error', reject)
                .run();
            });
          })
          .on('error', reject)
          .run();
      } else {
        // For non-HEIC images, use the original processing
        ffmpegCommand
          .outputOptions(['-vf', 'scale=800:800:force_original_aspect_ratio=decrease'])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      }
    });

    // Read the converted image
    const convertedImageBuffer = await fs.readFile(outputPath);
    const base64Image = convertedImageBuffer.toString('base64');

    // Clean up temporary files
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}