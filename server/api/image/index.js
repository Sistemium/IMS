'use strict';

const express = require('express');
const controller = require('./image.controller');
const multer = require('multer');
const uploadPath = require('../../config/environment').ims.uploadFolderPath;
const upload = multer({dest: uploadPath});

var router = express.Router();

router.get('/', controller.get);
router.post('/', upload.single('file'), controller.post);

module.exports = router;
