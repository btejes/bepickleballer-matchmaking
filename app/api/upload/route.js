import aws from 'aws-sdk';
import formidable from 'formidable-serverless';
import { getCookie } from 'cookies-next';
import { NextResponse } from 'next/server';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

export async function POST(req) {
  const token = getCookie('jwt', { req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = new formidable.IncomingForm();
  const formData = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const file = formData.files.file;
  const userId = formData.fields.userId;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${userId}/${file.name}`,
    Body: file,
    ContentType: file.type,
    ACL: 'public-read',
  };

  try {
    const data = await s3.upload(params).promise();
    return NextResponse.json({ Location: data.Location }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}

// Disable body parsing by Next.js
export const dynamic = 'force-dynamic';
