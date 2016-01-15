'use strict';

const AWS = require('aws-sdk');
const winston = require('winston');
const co = require('co');
const checkValidity = require('./checkDataValidity');
const checkStructure = require('./checkJsonStructure');
const config = require('../../config/environment').ims;

/**
 *
 * @param param
 */
export default function (paramObj) {
  let S3 = new AWS.S3(config.awsCredentials);
  const folder = paramObj.body.folder || req.query.folder;
  const checksum = paramObj.file.checksum;
  const prefix = `${folder}/${checksum}/`;
  const params = {
    Bucket: config.S3.bucket,
    Prefix: prefix
  };

  return new Promise(function (resolve, reject) {
    S3.listObjects(params, function (err, bucket) {
      // check if files correct resend if not
      if (err) {
        winston.log('error', `Error occurred while trying to get objects from ${JSON.stringify(params)}.
      Error message: ${err}`);
      }

      if (bucket && bucket.Contents && bucket.Contents.length > 0) {
        winston.log('info', `File with this checksum ${checksum} already uploaded...`);
        co(function* () {
          yield checkStructure(prefix);
        }).then(function () {
          try {
            checkValidity(bucket.Contents)
          } catch (err) {
            winston.log('error', `Error message: ${err}. Invalid data in the aws, retrying to resend...`);
            resolve();
          } finally {
            reject();
          }
        }, function (err) {

        });
      } else {
        winston.log('info', `No files with checksum ${checksum} uploaded...`);
        resolve();
      }
    });
  });
}
