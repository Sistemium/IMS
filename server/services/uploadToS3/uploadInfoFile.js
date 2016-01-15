'use strict';

const AWS = require('aws-sdk');
const config = require('../../config/environment').ims;
const winston = require('winston');

export default function (options) {
  return new Promise(function (resolve, reject) {
    let S3 = new AWS.S3(config.awsCredentials);
    const params = {
      Bucket: config.S3.Bucket,
      Key: options.key,
      Body: options.body,
      ContentType: 'application/json'
    };

    S3.putObject(params, function (err, response) {
      if (err) {
        winston.log('error', `Error during info file upload. Error message: ${err}`);
        return reject();
      }

      winston.log('info', `Successfully uploaded info file to the AWS...`);
      resolve(response);
    });
  });
}
