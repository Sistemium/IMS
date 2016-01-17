'use strict';

const fs = require('fs');
const config = require('../../config/environment').ims;
const winston = require('winston');
const _ = require('lodash');

export default function (dir, filename) {
  winston.log('info', 'Deleting files');
  fs.readdir(dir, (err, files) => {
    if (err) {
      winston.log('error', `Error occurred during reading directory ${dir}, error message ${err}`);
    }

    _.each(files, (file) => {

    })
  })
}
