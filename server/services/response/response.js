'use strict';

const winston = require('winston');
const AWS = require('aws-sdk');
const _ = require('lodash');
const config = require('../../config/environment/index').ims;

export default function (options) {
  let params = {
    Bucket: config.S3.Bucket,
    Prefix: options.prefix
  };

  return new Promise(function (resolve, reject) {
    let S3 = new AWS.S3(config.awsCredentials);
    S3.listObjects(params, function (err, response) {
      if (err) {
        winston.log('error', `Error occurred during retrieving files from AWS. Error message ${err}`);
        return reject(err);
      }

      try {
        if (response && response.Contents === undefined) {
          winston.log('error', 'Empty response from AWS...');
          reject('Contents are empty...');
        }

        response.Contents.forEach((i) => {
          params.Prefix = options.prefix + config.infoFile;

          S3.getObject(params, function (err, response) {
            if (err) {
              winston.log('error', `Error occurred while getting the object from ${params.Prefix}. Error message: ${err}`);
              return reject(err);
            }

            let infoFile = JSON.parse(response.Body.toString());
            response = formResponse(response.Contents, infoFile);
          })
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

function formResponse(contents, infoFile) {
  if (contents.length > 0) {
    let arr = contents[0].Key.split('/');
    let folder = arr[0];
    let name = arr[1];
    let resObj = {
      folder: folder,
      name: name,
      pictures: []
    };

    try {
      _.each(config.imageInfo, function (value, key) {
        contents.forEach(function (i) {
          let filename = i.Key.split('/').splice(-1)[0].split('.')[0];
          winston.log('debug', `filename name is: ${filename}`);
          winston.log('debug', `key name is: ${key}`);
          if (filename === key) {
            let search = _.findWhere(infoFile, {name: key});
            resObj.pictures.push({
              name: key,
              src: config.S3.Domain
            })
          } else {

          }
        });
      });
    } catch (err) {

    }
  }
}
