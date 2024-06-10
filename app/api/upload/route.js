import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import Busboy from 'busboy';

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

  return new Promise((resolve, reject) => {
    try {
      const jwtToken = cookies().get('token')?.value;
      console.log('JWT token:', jwtToken);

      if (!jwtToken) {
        console.log('No JWT token found');
        resolve(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        return;
      }

      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const userId = decoded._id;
      console.log('Token verified. User ID:', userId);

      // Ensure the upload directory exists
      const uploadDir = path.join(process.cwd(), 'tmp');
      fs.mkdir(uploadDir, { recursive: true })
        .then(() => {
          console.log('Upload directory ensured:', uploadDir);
          console.log("\nLogging entire req headers,", req.headers, "\n");
          const busboy = new Busboy({ headers: req.headers });
          console.log('Busboy instance created');

          let filePath;
          const fileWritePromises = [];

          busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            console.log('File event received');
            console.log(`Fieldname: ${fieldname}`);
            console.log(`Filename: ${filename}`);
            console.log(`Encoding: ${encoding}`);
            console.log(`Mimetype: ${mimetype}`);

            filePath = path.join(uploadDir, filename);
            const writeStream = fs.createWriteStream(filePath);
            file.pipe(writeStream);

            const filePromise = new Promise((res, rej) => {
              file.on('end', () => {
                console.log('File upload completed');
                res(filePath);
              });
              file.on('error', (error) => {
                console.error('File upload error:', error);
                rej(error);
              });
            });

            fileWritePromises.push(filePromise);
          });

          busboy.on('finish', async () => {
            console.log('Busboy finish event triggered');
            try {
              const files = await Promise.all(fileWritePromises);
              console.log('All files processed:', files);

              const fileStream = await fs.readFile(files[0]);
              console.log('File read successfully from temp path:', files[0]);

              // For now, return the file details for debugging purposes
              resolve(NextResponse.json({ filePath: files[0] }, { status: 200 }));
            } catch (error) {
              console.error('Error processing files:', error);
              resolve(NextResponse.json({ error: 'Error processing files' }, { status: 500 }));
            }
          });

          req.body.pipe(busboy);
        })
        .catch((error) => {
          console.error('Error ensuring upload directory:', error);
          reject(NextResponse.json({ error: 'Error ensuring upload directory' }, { status: 500 }));
        });
    } catch (error) {
      console.error('Error processing request:', error);
      reject(NextResponse.json({ error: 'Error processing request' }, { status: 500 }));
    }
  });
}
