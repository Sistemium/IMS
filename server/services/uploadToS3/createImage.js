'use strict';

const gm = require('gm').subClass({imageMagick: true});
const config = require('../../config/environment').ims;
const winston = require('winston');

export default function (options) {
  return new Promise(function (resolve, reject) {
    gm(options.image.path)
      .setFormat(config.format)
      .resize(options.width || 100, options.height || 100, '>')
      .write(options.path, function (err) {
        if (err) {
          winston.log('error', `Error occurred: ${err}`);
          reject(err);
        }
        winston.log('info', `File sized to ${option.width}x${options.height} at the path: ${options.path}`);
        resolve();
      });
  });
}
