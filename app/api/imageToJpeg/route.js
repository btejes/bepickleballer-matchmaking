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
    const output = execSync(`exiftool -ImageWidth -ImageHeight -j "${filePath}"`).toString().trim();
    const metadata = JSON.parse(output)[0];
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
    // Authorization code (unchanged)
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

    let dimensions = null;
    if (file.type === 'image/heic') {
      dimensions = await getImageDimensions(inputPath);
    }

    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputPath);
      
      if (file.type === 'image/heic') {
        const isVertical = dimensions && dimensions.height > dimensions.width;
        const scaleFilter = isVertical ? 'scale=800:-1' : 'scale=-1:800';

        ffmpegCommand = ffmpegCommand
          .outputOptions([
            '-vf', `${scaleFilter}`,
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