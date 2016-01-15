'use strict';

const imsConfig = require('../config/environment').ims;
const gm = require('gm').subClass({imageMagick: true});
const winston = require('winston');

export default function (file) {
  return new Promise(function (resolve, reject) {
    gm(file.path)
      .format(function (err, format) {
        if (err) {
          reject(err);
          winston.log('error', `Error during format checking. Error message:
           ${err}`);
        }

        format = format.toLowerCase();

        if (!imsConfig.contentType && !imsConfig.contentType[format]) {
          reject('Format not supported...');
          winston.log('warn', `There no option in configuration file for ${imsConfig.contentType}`);
        }

        if (imsConfig.contentType[format]) {
          file.contentType = imsConfig.contentType[format];
          winston.log('info', `Supported format, contentType set to: ${file.contentType}`);
          resolve();
        } else {
          winston.log('warn', `${format} is not supported`);
          reject();
        }
      });
  });
}
