'use strict';

const co = require('co');
import createImage from './createImage';
import uploadImage from './uploadImage';
import uploadInfoFile from './uploadInfoFile';
const config = require('../../config/environment').ims;
const debug = require('debug')('ims:uploadToS3');
const winston = require('winston');

export default function (req) {
  co(function* () {
    let imageInfoKeys = Object.keys(config.imageInfo);
    let cnfLength = imageInfoKeys.length;
    for (let i = 0; i < cnfLength; i++) {
      debug('createImage started');
      let fileOptions = config.imageInfo[imageInfoKeys[i]];
      //path for newly created file
      fileOptions.path = req.file.path + fileOptions.suffix;
      yield createImage(req.file.path, fileOptions);
      debug('createImage finished');

      debug('uploadImage started');
      yield uploadImage(req);
      debug('uploadImage finished');
    }

    debug('uploadInfoFile started');
    yield uploadInfoFile();
    debug('uploadInfoFile finished');
  }).catch(function (err) {
    winston.log('error', `Error occurred in uploadToS3/index.js, error message ${err}`);
  });
}
