'use strict';

const express = require('express');
const controller = require('./image.controller');
const multer = require('multer');
const uploadPath = require('../../config/environment').ims.uploadFolderPath;
const upload = multer({storage: uploadPath});

var router = express.Router();

router.get('/', controller.get);
router.post('/', upload.any(), controller.post);

module.exports = router;
