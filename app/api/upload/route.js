import aws from 'aws-sdk';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { IncomingForm } from 'formidable';
import fs from 'fs';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

export const dynamic = 'force-dynamic';

export async function POST(req) {
  return new Promise((resolve, reject) => {
    try {
      const jwtToken = cookies().get('token')?.value;
      if (!jwtToken) {
        resolve(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        return;
      }

      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          resolve(NextResponse.json({ error: 'Error parsing form data' }, { status: 500 }));
          return;
        }

        const file = files.file;
        const userId = decoded._id;

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${userId}/${file.originalFilename}`,
          Body: fs.createReadStream(file.filepath),
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        try {
          const data = await s3.upload(params).promise();
          resolve(NextResponse.json({ Location: data.Location }, { status: 200 }));
        } catch (error) {
          console.error('Error uploading to S3:', error);
          resolve(NextResponse.json({ error: 'Error uploading to S3' }, { status: 500 }));
        }
      });
    } catch (error) {
      console.error('Error:', error);
      resolve(NextResponse.json({ error: 'Error' }, { status: 500 }));
    }
  });
}

// We need to export the config for this route to ensure it can handle the file upload properly
export const config = {
  api: {
    bodyParser: false,
  },
};
