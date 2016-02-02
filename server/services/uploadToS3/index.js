'use strict';

const co = require('co');
import createImage from './createImage';
import uploadImage from './uploadImage';
import uploadInfoFile from './uploadInfoFile';
const config = require('../../config/environment').ims;
const debug = require('debug')('ims:uploadToS3');
const winston = require('winston');

export default function (path, prefix) {
  return co(function* () {
    let imageInfoKeys = Object.keys(config.imageInfo);
    let cnfLength = imageInfoKeys.length;
    let infoFileData = [];
    console.log(imageInfoKeys);

    for (let i = 0; i < cnfLength; i++) {

      debug('createImage started');
      let fileOptions = config.imageInfo[imageInfoKeys[i]];
      //path for newly created file
      fileOptions.path = path + fileOptions.suffix;
      yield createImage(path, fileOptions);
      debug('createImage finished');

      debug('uploadImage started');
      let uploadImageParams = {
        file: {
          path: fileOptions.path,
          contentType: config.supportedFormats[config.format]
        },
        key: `${prefix}${imageInfoKeys[i]}`,
        imageInfoKey: imageInfoKeys[i]
      };
      let uploadedFileInfo = yield uploadImage(uploadImageParams);
      infoFileData.push(uploadedFileInfo);
      debug('uploadImage finished');
    }

    debug('upload original image started');
    let ouiParams = {
      file: {
        path: path,
        contentType: config.supportedFormats[config.format]
      },
      key: `${prefix}original`,
      imageInfoKey: 'original'
    };
    let ufInfo = yield uploadImage(ouiParams);
    infoFileData.push(ufInfo);
    debug('upload original image finished');

    debug('uploadInfoFile started');
    let uifOptions = {
      key: `${prefix}${config.infoFile}`,
      body: JSON.stringify(infoFileData)
    };
    yield uploadInfoFile(uifOptions);
    debug('uploadInfoFile finished');

  }).catch(function (err) {
    winston.log('error', `Error occurred in uploadToS3/index.js, error message ${err}`);
  });
}
