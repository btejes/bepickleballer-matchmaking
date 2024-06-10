import aws from 'aws-sdk';
import { NextResponse } from 'next/server';
import { getCookies } from 'next/headers';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

export async function POST(req) {
  const cookies = getCookies();
  const token = cookies.jwt;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const userId = formData.get('userId');

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

// Ensure compatibility with Next.js 14+ app router
export const dynamic = 'force-dynamic';
