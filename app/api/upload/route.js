import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs/promises';

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
  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded._id;

    const form = formidable({ multiples: true, keepExtensions: true });
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    const file = formData.files.file;
    const fileStream = await fs.readFile(file.filepath);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${file.originalFilename}`,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    
    // Optional: Save fileUrl to user profile in database here

    return NextResponse.json({ Location: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}
