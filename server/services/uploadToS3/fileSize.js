'use strict';

const fs =require('fs');
const imageSize = require('image-size');

export default function (path) {
  let file = fs.readFileSync(path);
  return imageSize(file);
}
