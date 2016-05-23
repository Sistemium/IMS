'use strict';

const gm = require('gm').subClass({imageMagick: true});
const config = require('../../config/environment').ims;
const winston = require('winston');
const debug = require('debug')('ims:createImage');

export default function (filePath, fileOptions) {

  return new Promise(function (resolve, reject) {
    gm(filePath)
      .setFormat(config.format)
      .resize(fileOptions.width || 100, fileOptions.height || 100, '>')
      .autoOrient()
      .write(fileOptions.path, function (err) {
        if (err) {
          winston.log('error', `Error occurred: ${err}`);
          reject(err);
        }
        winston.log('info', `File sized to ${fileOptions.width}x${fileOptions.height} at the path: ${fileOptions.path}`);
        resolve();
      });
  });
}
