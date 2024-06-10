import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs/promises';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const form = new formidable.IncomingForm();
    form.uploadDir = '/tmp';
    form.keepExtensions = true;

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
    const userId = decoded._id;

    const fileStream = await fs.readFile(file.filepath);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${file.originalFilename}`,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);

    return NextResponse.json({ Location: data.Location }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}
