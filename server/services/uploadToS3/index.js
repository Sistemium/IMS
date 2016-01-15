'use strict';

const co = require('co');
const createImage = require('./createImage');
const uploadImage = require('./uploadImage');
const uploadInfoFile = require('./uploadInfoFile');
const config = require('../../config/environment').ims;

export default function (req) {
  co(function* () {
    _.each(config.imageInfo, function () {
      yield createImage(req);
      yield uploadImage(req);
    });

    yield uploadInfoFile();
  });
}
