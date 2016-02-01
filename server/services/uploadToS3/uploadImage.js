'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const fileSize = require('./fileSize');
const config = require('../../config/environment').ims;
const winston =require('winston');

export default function (options) {
  return new Promise(function (resolve, reject) {
    let imageStream = fs.createReadStream(options.file.path);
    let file = fileSize(options.file.path);

    const S3 = new AWS.S3(config.awsCredentials);
    const params = {
      Bucket: config.S3.bucket,
      Key: options.key,
      Body: imageStream,
      ContentType: options.file.contentType,
      Metadata: {
        width: file.width.toString(),
        height: file.height.toString()
      }
    };

    S3.putObject(params, function (err) {
      if (err) {
        winston.log('error', `Error occurred: ${err}`);
        return reject(err);
      }

      resolve({
        name: options.imageInfoKey,
        bucketKey: options.key,
        height: file.height,
        width: file.width
      });
    });
  });
}
