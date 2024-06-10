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

    // Check if Formidable is correctly imported and used
    const IncomingForm = formidable.IncomingForm || formidable;
    console.log('Formidable:', formidable);
    console.log('Formidable IncomingForm:', IncomingForm);

    // Create and configure Formidable form
    const form = new IncomingForm();
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

    // Check if formData.files.file is an array and get the first element if it is
    const file = Array.isArray(formData.files.file) ? formData.files.file[0] : formData.files.file;
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
