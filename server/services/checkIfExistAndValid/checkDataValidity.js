'use strict';

const config = require('../../config/environment').ims;
const imageInfo = config.imageInfo;
const winston = require('winston');
const _ = require('lodash');

/**
 *
 * @param contents
 */
export default function (contents) {
  let counter = 0;

  // check that keys in config.imageInfo equals to files uploaded to s3
  _.each(imageInfo, function (item, key) {
    contents.forEach((objFromS3) => {
      let filename = objFromS3.Key.split('/').splice(-1)[0].split('.')[0];
      if (filename === key) {
        counter++;
      }
    });
  });

  let keysLength = Object.keys(imageInfo).length;
  if (counter !== keysLength) {
    winston.log('error', `Uploaded file is incorrect`);
    throw new Error(`Count of configured images, does not match count of images on s3.
      Expected to have ${keysLength} but got ${counter}`);
  }
}
