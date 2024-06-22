import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

// On Heroku, ffmpeg should be available in the PATH due to the buildpack
ffmpeg.setFfmpegPath('ffmpeg');

async function getImageOrientation(filePath) {
  try {
    const output = execSync(`identify -format "%[orientation]" "${filePath}"`).toString().trim();
    return output;
  } catch (error) {
    console.error('Error getting image orientation:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    const jwtToken = cookies().get('token')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;

    const body = await req.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log("\nfile type:", file.type, "\n");
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `${file.type} not accepted. Please submit one of the following: JPEG, JPG, PNG, WEBP, HEIC` }, { status: 400 });
    }

    const imageBuffer = Buffer.from(file.buffer, 'base64');

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

    await fs.writeFile(inputPath, imageBuffer);

    let orientation = null;
    if (file.type === 'image/heic') {
      orientation = await getImageOrientation(inputPath);
    }

    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputPath);
      
      if (file.type === 'image/heic') {
        let rotateFilter = '';
        if (orientation === '6') {
          rotateFilter = 'transpose=1,';  // 90 degrees clockwise
        } else if (orientation === '8') {
          rotateFilter = 'transpose=2,';  // 90 degrees counter-clockwise
        } else if (orientation === '3') {
          rotateFilter = 'rotate=180*PI/180,';  // 180 degrees
        }

        ffmpegCommand = ffmpegCommand
          .outputOptions([
            '-vf', `${rotateFilter}scale=800:800:force_original_aspect_ratio=decrease`,
            '-q:v', '2',
            '-pix_fmt', 'yuvj420p'
          ]);
      } else {
        ffmpegCommand = ffmpegCommand
          .outputOptions(['-vf', 'scale=800:800:force_original_aspect_ratio=decrease']);
      }
      
      ffmpegCommand.output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const convertedImageBuffer = await fs.readFile(outputPath);
    const base64Image = convertedImageBuffer.toString('base64');

    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error processing the image upload:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}