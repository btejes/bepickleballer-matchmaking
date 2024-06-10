import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

// Create the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
    if (!jwtToken) {
      console.log('No JWT token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('JWT token found:', jwtToken);

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;
    console.log('Token verified. User ID:', userId);

    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'tmp'); // Ensure this directory exists
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

    const file = formData.files.file;
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File uploaded:', file);

    const fileStream = await fs.readFile(file.filepath);
    console.log('File read successfully from temp path:', file.filepath);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${file.originalFilename}`,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    console.log('Upload params:', uploadParams);

    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);
    console.log('File uploaded to S3. Response data:', data);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    console.log('File URL:', fileUrl);
    
    // Optional: Save fileUrl to user profile in database here

    return NextResponse.json({ Location: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}
