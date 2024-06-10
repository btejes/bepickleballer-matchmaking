import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

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

    // Create and configure Formidable form
    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    console.log('Formidable form created with uploadDir:', form.uploadDir);

    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          reject(err);
        } else {
          console.log('Form parsed successfully. Fields:', fields, 'Files:', files);
          resolve({ fields, files });
        }
      });
    });

    console.log('FormData:', formData);

    const file = Array.isArray(formData.files.file) ? formData.files.file[0] : formData.files.file;
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File uploaded:', file);

    const fileStream = await fs.readFile(file.filepath);
    console.log('File read successfully from temp path:', file.filepath);

    // For now, return the file details for debugging purposes
    return NextResponse.json({ file }, { status: 200 });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}
