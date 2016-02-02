'use strict';

const AWS = require('aws-sdk');
const _ = require('lodash');
const winston = require('winston');
const config = require('../../config/environment').ims;
const S3 = new AWS.S3(config.awsCredentials);

export default function (prefix) {
  const infoFileKey = prefix + config.infoFile;
  const params = {
    Bucket: config.S3.bucket,
    Key: infoFileKey
  };

  return new Promise(function (resolve, reject) {
    winston.log('debug', 'Checking info file structure');
    winston.log('info', `Info file key ${infoFileKey} `);
    S3.getObject(params, function (err, response) {
      if (err) {
        winston.log('error', `Error occurred while trying to read info file from S3. Error message: ${err}`);
        reject(err);
      } else {
        let parsed = JSON.parse(response.Body.toString());
        _.each(config.imageInfo, function (n, key) {

          let res = _.where(parsed, {name: key});
          if (res.length != 1) {
            winston.log('error', `Incorrect ${config.infoFile} file...`);
            reject();
          }
        });
        resolve();
      }
    });
  });
}
