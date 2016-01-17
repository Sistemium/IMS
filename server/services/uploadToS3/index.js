'use strict';

const co = require('co');
const createImage = require('./createImage');
const uploadImage = require('./uploadImage');
const uploadInfoFile = require('./uploadInfoFile');
const config = require('../../config/environment').ims;

export default function (req) {
  co(function* () {
    yield Promise.resolve();
    let cnfLength = config.imageInfo.length;
    for (let i = 0; i < cnfLength; i++) {
      yield createImage(req);
      yield uploadImage(req);
    }

    yield uploadInfoFile();
  });
}
