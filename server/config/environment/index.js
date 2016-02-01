'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'ims-secret'
  },

  //image service config
  ims: {
    imageInfo: {
      smallImage: {
        "width": 800,
        "height": 800,
        "suffix": "small"
      },
      mediumImage: {
        "width": 2000,
        "height": 2000,
        "suffix": "medium"
      },
      thumbnail: {
        "width": 200,
        "height": 200,
        "quality": 100,
        "suffix": "thumbnail"
      }
    },

    awsCredentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    uploadFolderPath: process.env.IMS_UPLOAD_FOLDER_PATH || '../../uploads/',
    supportedFormats: {
      'jpeg': 'image/jpg'
    },

    S3: {
      bucket: process.env.IMS_S3_BUCKET || 'sisdev',
      domain: process.env.IMS_S3_DOMAIN || 'domain'
    },

    infoFile: process.env.IMS_INFO_FILE || 'info.json',

    format: 'png'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
