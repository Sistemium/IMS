'use strict';

const AWS = require('aws-sdk');
const winston = require('winston');
const co = require('co');
const checkValidity = require('./checkDataValidity');
const checkStructure = require('./checkJsonStructure');
const config = require('../../config/environment').ims;
const debug = require('debug')('ims:checkIfExistAndValid');

/**
 *
 * @param prefix String
 * @param checksum String
 * @returns {Promise}
 */
export default function (prefix, checksum) {
  let S3 = new AWS.S3(config.awsCredentials);
  // maybe make default folder?

  const params = {
    Bucket: config.S3.bucket,
    Prefix: prefix
  };

  return new Promise(function (resolve) {
    S3.listObjects(params, function (err, bucket) {
      // check if files correct resend if not
      if (err) {
        winston.log('error', `Error occurred while trying to get objects from ${JSON.stringify(params)}.
      Error message: ${err}`);
      }

      if (bucket && bucket.Contents && bucket.Contents.length > 0) {
        winston.log('info', `File with this checksum ${checksum} already uploaded...`);
        co(function* () {
          debug('checkStructure started');
          yield checkStructure(prefix);
          debug('checkStructure finished');

          try {
            debug('checkValidity started');
            checkValidity(bucket.Contents);
            debug('checkValidity finished');
          } catch (err) {
            winston.log('error', `Error message: ${err}. Invalid data in the aws, retrying to resend...`);
            resolve(false);
          } finally {
            resolve(true);
          }
        }).catch(function (err) {
          winston.log('error', `Error occurred while checking validity, error message ${err}`);
          winston.log('info', `Trying to resend`);
          resolve(false);
        })
      } else {
        winston.log('info', `No files with checksum ${checksum} uploaded...`);
        resolve(false);
      }
    });
  });
}
