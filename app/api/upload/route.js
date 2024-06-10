import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          resolve(NextResponse.json({ error: 'Error parsing form data' }, { status: 500 }));
          return;
        }

        const file = files.file;
        const userId = decoded._id;

        const fileStream = fs.createReadStream(file.filepath);

        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${userId}/${file.originalFilename}`,
          Body: fileStream,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        try {
          const parallelUploads3 = new Upload({
            client: s3Client,
            params: uploadParams,
          });

          parallelUploads3.on('httpUploadProgress', (progress) => {
            console.log(progress);
          });

          const data = await parallelUploads3.done();
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

export const config = {
  api: {
    bodyParser: false,
  },
};
