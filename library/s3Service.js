const AWS = require('aws-sdk');
require('dotenv').config();

// Load credentials and set the region from the environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1'
});

// Create S3 service object
const s3 = new AWS.S3();

// Function to upload a file
const uploadFile = (fileName, fileContent) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ACL: 'public-read' // Optional: Set file to be publicly readable
  };

  return s3.upload(params).promise();
};

module.exports = { uploadFile };
