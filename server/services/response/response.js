'use strict';

const winston = require('winston');
const AWS = require('aws-sdk');
const _ = require('lodash');
const config = require('../../config/environment/index').ims;

export default function (prefix) {
  let params = {
    Bucket: config.S3.bucket,
    Prefix: prefix
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

        let foundConfig = false;
        response.Contents.forEach((item) => {
          let fileName = item.Key.split('/').splice(-1)[0];

          if(fileName === config.infoFile) {
            foundConfig = true;
            params.Key = prefix + config.infoFile;
            delete params.Prefix;

            S3.getObject(params, function (err, innerResponse) {
              if (err) {
                winston.log('error', `Error occurred while getting the object from ${params.Prefix}. Error message: ${err}`);
                return reject(err);
              }

              let infoFile = JSON.parse(innerResponse.Body.toString());
              innerResponse = formResponse(response.Contents, infoFile, reject);
              resolve(innerResponse);
            });
          }
        });

        if (!foundConfig) {
          reject('Error occurred in response.js file. InfoFile not found...');
        }

      } catch (err) {
        reject(`Error occurred in response.js file... Error message: ${err}`);
      }
    });
  });
}

function formResponse(contents, infoFile, reject) {
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
        let existInConfig = false;
        contents.forEach(function (i) {
          let filename = i.Key.split('/').splice(-1)[0].split('.')[0];
          winston.log('debug', `filename name is: ${filename}`);
          winston.log('debug', `key name is: ${key}`);
          if (filename === key) {
            existInConfig = true;
            let search = _.findWhere(infoFile, {name: key});
            resObj.pictures.push({
              name: key,
              src: config.S3.Domain,
              height: search.height,
              width: search.width
            });
          }
        });
        if (!existInConfig) {
          reject(`Error occurred in response.js file. No such key "${key}" in config file...`);
        }
      });
    } catch (err) {
      reject(`Error occurred in response.js file... Error message ${err}`);
    }

    return resObj;
  }
}
