import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

const http = require('http');

const busboy = require('busboy');

// Ensure that this route runs in the Node.js environment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Update config based on new standards
export const segmentConfig = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export async function POST(req) {
  console.log('POST request received');

  try {
    const jwtToken = cookies().get('token')?.value;
    console.log('JWT token:', jwtToken);

    if (!jwtToken) {
      console.log('No JWT token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    console.log('Token verified. User ID:', userId);

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Upload directory ensured:', uploadDir);

    // Create Busboy instance
    const bb = new busboy({ headers: req.headers });
    console.log('Busboy instance created');


    return 42;
    let filePath;
    const fileWritePromises = [];

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log('File event received');
      console.log(`Fieldname: ${name}`);
      console.log(`Filename: ${filename}`);
      console.log(`Encoding: ${encoding}`);
      console.log(`Mimetype: ${mimeType}`);

      filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      file.pipe(writeStream);

      const filePromise = new Promise((resolve, reject) => {
        file.on('end', () => {
          console.log('File upload completed');
          resolve();
        });
        file.on('error', (error) => {
          console.error('File upload error:', error);
          reject(error);
        });
      });

      fileWritePromises.push(filePromise);
    });

    bb.on('field', (name, value, info) => {
      console.log(`Field event received: ${name}=${value}`);
    });

    bb.on('close', async () => {
      console.log('Busboy finish event triggered');
      try {
        await Promise.all(fileWritePromises);
        console.log('All files processed');

        const fileStream = await fs.readFile(filePath);
        console.log('File read successfully from temp path:', filePath);

        // For now, return the file details for debugging purposes
        return NextResponse.json({ filePath }, { status: 200 });
      } catch (error) {
        console.error('Error processing files:', error);
        return NextResponse.json({ error: 'Error processing files' }, { status: 500 });
      }
    });

    req.pipe(bb);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
