'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const fileSize = require('./fileSize');
const config = require('../../config/environment').ims;
const winston =require('winston');

export default function (options) {
  return new Promise(function (resolve, reject) {
    let imageStream = fs.createReadStream(options.image.path);
    let fileSize = fileSize(options.image.path);

    const S3 = new AWS.S3(config.awsCredentials);
    const params = {
      Bucket: config.S3.Bucket,
      Key: options.path,
      Body: imageStream,
      ContentType: options.image.contentType,
      Metadata: {
        width: fileSize.width.toString(),
        height: fileSize.height.toString()
      }
    };

    S3.putObject(params, function (err) {
      if (err) {
        winston.log('error', `Error occurred: ${err}`);
        return reject(err);
      }

      resolve({
        name: options.name,
        bucketKey: options.path,
        width: fileSize.width,
        height: fileSize.height
      })
    });
  });
}
