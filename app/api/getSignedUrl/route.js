import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

const s3ClientConfig = {
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(s3ClientConfig);

export async function GET(req) {
  const session = await getServerSession(req, options);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}`,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });
    return new Response(JSON.stringify({ url: signedUrl }), { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return new Response(JSON.stringify({ error: "Error generating signed URL" }), { status: 500 });
  }
}
