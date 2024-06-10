import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
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

    const data = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const boundary = req.headers['content-type'].split('boundary=')[1];
    const parts = data.toString().split(`--${boundary}`);
    const filePart = parts.find((part) => part.includes('Content-Disposition: form-data; name="file";'));

    if (!filePart) {
      console.log('No file part found');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileContentType = filePart.match(/Content-Type: (.*)/)[1].trim();
    const fileContent = Buffer.from(filePart.split('\r\n\r\n')[1].split('\r\n--')[0]);

    const fileName = `image-${Date.now()}`;
    const fileExtension = fileContentType.split('/')[1];
    const s3Key = `${userId}/${fileName}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: fileContentType,
      ACL: 'public-read',
    };

    console.log('Upload params:', uploadParams);

    const command = new PutObjectCommand(uploadParams);
    const s3Response = await s3Client.send(command);
    console.log('File uploaded to S3. Response data:', s3Response);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log('File URL:', fileUrl);

    // Optional: Save fileUrl to user profile in database here

    return NextResponse.json({ Location: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}
