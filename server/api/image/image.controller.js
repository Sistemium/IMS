/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/image              ->  index
 */

'use strict';
import co from 'co';
import winston from 'winston';
import uuid from 'node-uuid';
import fs from 'fs';
import checkFormat from '../../services/checkFormat';
import checksum from '../../services/generateChecksum';
import checkIfExistAndValid from '../../services/checkIfExistAndValid';
import uploadToS3 from '../../services/uploadToS3';
import cleanup from '../../services/cleanup';
import response from '../../services/response/response';
const config = require('../../config/environment').ims;
const debug = require('debug')('ims:image.controller');
const path = require('path');

export function get(req, res) {
  res.json([]);
}

export function post(req, res) {

  if (!req || !req.file) {
    return res.status(400).end('File was not passed...');
  }

  let file = req.file;
  if (file !== undefined) {
    winston.log('info', `Multipart file upload for ${file.path} started...`);
    execute();
  }

  function execute() {
    co(function* () {

      //check file format
      debug('checkFormat started');
      yield checkFormat(file);
      debug('checkFormat finished');

      //find checksum of the file
      debug('checksum started');
      let chsm = yield checksum(file.path);
      debug('checksum finished');

      //check if already exist on amazon and if it correct
      debug('checkIfExistAndValid started');
      const folder = req.body.folder || req.query.folder;
      const prefix = `${folder}/${chsm}/`;
      let existAndValid = yield checkIfExistAndValid(prefix, chsm);
      debug('checkIfExistAndValid finished');

      //files not already uploaded or not valid
      if (!existAndValid) {
        debug('uploadToS3 started');
        yield uploadToS3(file.path, prefix);
        debug('uploadToS3 finished');
      }

      cleanup(res.locals.folder);

      debug('response started');
      let resData = yield response(prefix);
      debug('response finished');

      return res.json(resData);

    }).catch(function (err) {
      winston.log('error', `Error occurred ${err.stack}`);
    });
  }
}
