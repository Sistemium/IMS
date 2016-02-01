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
const debug = require('debug')('ims:image.controller');

export function get(req, res) {
  res.json([]);
}

export function post(req, res) {

  if (!req || !req.file) {
    return res.status(400).end('File was not passed...');
  }

  let file = req.file;
  if  (file !== undefined) {
    winston.log('info', `Multipart file upload for ${file.path} started...`);
    let folder = config.uploadFolderPath + uuid.v4();
    mkdirp(folder, () => {
      let ws = fs.createWriteStream(`${folder}/${file.name}`);
      let rs = fs.createReadStream(file.path);
      rs.pipe(ws);
      ws.on('finish', function () {
        execute();
      });
    });
  }

  function execute() {
    co(function* () {

      //check file format
      debug('checkFormat started');
      yield checkFormat(req.file);
      debug('checkFormat finished');

      //find checksum of the file
      debug('checksum started');
      let chsm = yield checksum(req.file.path);
      debug('checksum finished');
      req.file.checksum = chsm;

      //check if already exist on amazon and if it correct
      debug('checkIfExistAndValid started');
      yield checkIfExistAndValid(req);
      debug('checkIfExistAndValid finished');

      //files not already uploaded or not valid
      debug('uploadToS3 started');
      yield uploadToS3(req);
      debug('uploadToS3 finished');

    }).then(function () {
      response();
      return res.status(200);
    }, function (err) {
      winston.log('error', `Something went wrong, error message ${err}`);
    }).catch (function (err) {
      winston.log('error', `Error occurred ${err}`);
    });
  }
}
