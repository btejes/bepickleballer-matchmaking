import aws from 'aws-sdk';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const jwtToken = cookies().get('token')?.value;
    if (!jwtToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const formData = await request.formData();
    const file = formData.get('file');
    const userId = decoded._id;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${file.name}`,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',
    };

    const data = await s3.upload(params).promise();
    return NextResponse.json({ Location: data.Location }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 });
  }
}
