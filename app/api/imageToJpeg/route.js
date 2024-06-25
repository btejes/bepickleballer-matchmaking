import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';


import { ApiClient, ConvertImageApi } from 'cloudmersive-convert-api-client';

// Configure API client with environment variable for the API key
const apiClient = new ApiClient();
apiClient.setApiKey(process.env.CLOUDMERSIVE_API_KEY); // Ensure your API key is correctly set in your environment variables

const convertApi = new ConvertImageApi(apiClient);

async function processHEICImage(file, userId) {
  console.log("Processing HEIC image");

  const imageBuffer = Buffer.from(file.buffer, 'base64');
  console.log(`Image buffer size: ${imageBuffer.length} bytes`);

  try {
    console.log("Starting conversion with Cloudmersive API");

    const callback = function (error, data, response) {
      if (error) {
        console.error('Error during HEIC to JPEG conversion with Cloudmersive:', error);
        return NextResponse.json({ error: 'Failed to convert HEIC to JPEG', details: error.message }, { status: 500 });
      } else {
        const convertedImageBuffer = Buffer.from(data, 'binary'); // Adjust according to the response format
        const base64Image = convertedImageBuffer.toString('base64');
        console.log("HEIC to JPEG conversion completed successfully");
        return NextResponse.json({ image: base64Image }, { status: 200 });
      }
    };

    // Call Cloudmersive API to convert the image from HEIC to JPEG
    convertApi.convertImageImageFormatConvert('HEIC', 'JPG', imageBuffer, callback);
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

  await sharp(inputPath)
    .resize(800, 800, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFile(outputPath);

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
      console.log("Unsupported file type");
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.type === 'image/heic') {
      return processHEICImage(file, userId);
    } else {
      return processNormalImage(file, userId);
    }
  } catch (error) {
    console.error('Error during image processing:', error);
    return NextResponse.json({ error: 'Failed to process image', details: error.message }, { status: 500 });
  }
}
