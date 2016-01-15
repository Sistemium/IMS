'use strict';

var express = require('express');
var controller = require('./image.controller');
var multer = require('multer');

var router = express.Router();

router.get('/', controller.get);
router.post('/', multer(), controller.post)

module.exports = router;
