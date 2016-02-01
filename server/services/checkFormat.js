'use strict';

const imsConfig = require('../config/environment').ims;
const gm = require('gm').subClass({imageMagick: true});
const winston = require('winston');
const debug = require('debug')('ims:*');

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

        //debug('checkFormat', imsConfig);
        if (!imsConfig.supportedFormats && !imsConfig.supportedFormats[format]) {
          reject('Format not supported...');
          winston.log('warn', `There no option in configuration file for ${imsConfig.contentType}`);
        }

        if (imsConfig.supportedFormats[format]) {
          file.contentType = imsConfig.supportedFormats[format];
          winston.log('info', `Supported format, contentType set to: ${file.contentType}`);
          resolve();
        } else {
          winston.log('warn', `${format} is not supported`);
          reject();
        }
      });
  });
}
