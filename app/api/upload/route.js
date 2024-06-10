import aws from 'aws-sdk';
import formidable from 'formidable-serverless';
import { getCookie } from 'cookies-next';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

export const GET = async (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed' });
};

export const POST = async (req, res) => {
  const token = getCookie('jwt', { req, res });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the files' });
    }

    const file = files.file;
    const userId = fields.userId;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${file.name}`,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',
    };

    try {
      const data = await s3.upload(params).promise();
      return res.status(200).json({ Location: data.Location });
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return res.status(500).json({ error: 'Error uploading to S3' });
    }
  });
};

// Ensure compatibility with Next.js 14+ app router
export const config = {
  api: {
    bodyParser: false,
  },
};
