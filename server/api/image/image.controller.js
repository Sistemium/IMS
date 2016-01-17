/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/image              ->  index
 */

'use strict';
import co from 'co';
import winston from 'winston';
import mkdirp from 'mkdirp';
import uuid from 'node-uuid';
import fs from 'fs';
import checkFormat from '../../services/checkFormat';
import checksum from '../../services/generateChecksum';
import checkIfExistAndValid from '../../services/checkIfExistAndValid';
import uploadToS3 from '../../services/uploadToS3';
import response from '../../services/response/response';
const config = require('../../config/environment').ims;

export function get(req, res) {
  res.json([]);
}

export function post(req, res) {

  let file = req.file = req.files.file;
  if  (file !== undefined) {
    winston.log('info', `Multipart file upload for ${file} started...`);
    let folder = config.uploadFolderPath + uuid.v4();
    mkdirp(folder, () => {
      let ws = fs.createWriteStream(`${folder}/${file.name}`);
      file.pipe(ws);
      ws.on('finish', function () {
        execute();
      });
    });
  }

  function execute() {
    co(function* () {

      //check file format
      yield checkFormat(req.file);

      //find checksum of the file
      let checksum = yield checksum(req.file.path);
      req.file.checksum = checksum;

      //check if already exist on amazon and if it correct
      yield checkIfExistAndValid(req);

      //files not already uploaded or not valid
      //yield uploadToS3(req);

    }).then(function () {
      response();
    }, function () {

    });
  }
}
