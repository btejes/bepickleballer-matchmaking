import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'tmp');
  form.keepExtensions = true;

  await fs.mkdir(form.uploadDir, { recursive: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error parsing form' });
    }

    console.log('Fields:', fields);
    console.log('Files:', files);

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileStream = await fs.readFile(file.filepath);
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now()}_${file.originalFilename}`,
        Body: fileStream,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const command = new PutObjectCommand(uploadParams);
      const data = await s3Client.send(command);

      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      console.log('File URL:', fileUrl);

      return res.status(200).json({ Location: fileUrl });
    } catch (uploadError) {
      console.error('Error uploading to S3:', uploadError);
      return res.status(500).json({ error: 'Error uploading to S3' });
    }
  });
}
