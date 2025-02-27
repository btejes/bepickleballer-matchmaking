import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// Function to process normal images
async function processNormalImage(file, userId) {
  // console.log("Processing normal image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  // console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);
  // console.log(`Input path: ${inputPath}`);
  // console.log(`Output path: ${outputPath}`);

  await fs.writeFile(inputPath, imageBuffer);
  // console.log("Temporary input file created");

  try {
    // Resize and crop the image to a centered 800x800 square
    await sharp(inputPath)
      .rotate() // This will rotate the image according to EXIF data
      .resize(800, 800, {
        fit: sharp.fit.cover, // This will ensure the image covers the 800x800 area, cropping as necessary
        position: 'center' // Ensure the image is centered
      })
      .toFile(outputPath);

    // console.log("Reading converted image");
    const convertedImageBuffer = await fs.readFile(outputPath);
    const base64Image = convertedImageBuffer.toString('base64');
    // console.log(`Converted image size: ${convertedImageBuffer.length} bytes`);

    // console.log("Cleaning up temporary files");
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    // console.log("Normal image processing completed successfully");
    return NextResponse.json({ image: base64Image }, { status: 200 });
  } catch (error) {
    console.error('Error processing image:', error);
    // Cleanup even if there's an error
    await fs.unlink(inputPath).catch(e => console.error("Error cleaning up input file:", e));
    await fs.unlink(outputPath).catch(e => console.error("Error cleaning up output file:", e));
    throw error; // Rethrow to handle in the calling function
  }
}

export async function POST(req) {
  try {
    // console.log("Starting image processing...");

    // Authorization code
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      // console.log("Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    // console.log(`Processing request for user: ${userId}`);

    const body = await req.json();
    const { file } = body;

    if (!file) {
      // console.log("No file uploaded");
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // console.log(`File type: ${file.type}`);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      // console.log("Unsupported file type");
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Process the image if it's an allowed type
    return processNormalImage(file, userId);
  } catch (error) {
    console.error('Error during image processing:', error);
    return NextResponse.json({ error: 'Failed to process image', details: error.message }, { status: 500 });
  }
}
