'use strict';

const crypto = require('crypto');
const fs = require('fs');
const winston = require('winston');

export default function (image) {
  return new Promise(function (resolve, reject) {
    let stream = fs.createReadStream(image)
      , hash = crypto.createHash('md5');

    stream.on('data', function (data) {
      hash.update(data, 'utf8');
    });

    stream.on('end', function () {
      let checksum = hash.digest('hex');
      winston.log('info', `Generated checksum is ${checksum}`);
      resolve(checksum);
    });

    stream.on('error', function (err) {
      winston.log('error', `Error occurred during reading image ${image}. Error message ${err}`);
      reject(err);
    })
  })
}
