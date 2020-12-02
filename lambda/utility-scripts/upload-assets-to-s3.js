#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const glob = require('glob');

(async () => {
  AWS.config.update({ region: 'us-east-1' });

  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  const assetsBasePath = path.resolve(__dirname, '../../assets');

  const files = glob.sync('**/*', {
    cwd: assetsBasePath,
    nodir: true,
  });

  for (const file of files) {
    const filepath = path.resolve(assetsBasePath, file);

    console.log('Uploading file:', file);

    const fileStream = fs.createReadStream(filepath);
    fileStream.on('error', function (err) {
      console.error('File error:', err);
      throw err;
    });

    const uploadParams = {
      Bucket: process.env.ASSETS_BUCKET_NAME,
      Body: fileStream,
      Key: file,
    };

    try {
      await s3.upload(uploadParams).promise();
    } catch (err) {
      console.error(`Error uploading ${file}!`, err);

      throw err;
    }
  }

  console.log(`Done uploading ${files.length} files ✅`);
})();
