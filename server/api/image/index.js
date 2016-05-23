'use strict';

const express = require('express');
const controller = require('./image.controller');
const multer = require('multer');
const uploadPath = require('../../config/environment').ims.uploadFolderPath;
const path = require('path');
const uuid = require('node-uuid');
const mkdirp = require('mkdirp');

const destPath = path.normalize(path.join(__dirname, uploadPath, uuid.v4()));
function setUploadPath(req, res, next) {
  mkdirp(destPath, (err) => {
    if (err) next(err);

    res.locals.folder = destPath;
    next();
  });
}


const upload = multer({dest: destPath});

var router = express.Router();

router.get('/', controller.get);
router.post('/', setUploadPath, upload.single('file'), controller.post);

module.exports = router;
