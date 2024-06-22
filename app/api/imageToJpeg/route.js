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

    console.log("\nFile object:", JSON.stringify(file, null, 2), "\n");

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    let fileExtension = '';

    if (file.name) {
      fileExtension = path.extname(file.name).toLowerCase();
    } else if (file.type) {
      // If no file name, try to infer extension from MIME type
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/heic': '.heic',
        'image/heif': '.heif'
      };
      fileExtension = mimeToExt[file.type] || '';
    }

    const isAllowedType = allowedTypes.includes(file.type) || ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(fileExtension);

    if (!isAllowedType) {
      return NextResponse.json({ 
        error: `File type ${file.type || 'unknown'} (${fileExtension || 'no extension'}) not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` 
      }, { status: 400 });
    }

    const imageBuffer = Buffer.from(file.buffer, 'base64');

    // Create temporary input and output files
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}${fileExtension}`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

    await fs.writeFile(inputPath, imageBuffer);

    // Use FFmpeg to convert the image
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf', 'scale=800:800:force_original_aspect_ratio=decrease',
          '-auto-orient',  // Preserve original orientation
          '-colorspace', 'srgb'  // Convert to sRGB color space
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
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
    return NextResponse.json({ error: 'Failed to process image: ' + error.message }, { status: 500 });
  }
}