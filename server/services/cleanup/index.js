'use strict';

const fs = require('fs');
const config = require('../../config/environment').ims;
const winston = require('winston');
const debug = require('debug')('ims:cleanup');
const verboseDebug = require('debug')('ims:cleanup:verbose');

export default function (path) {
  var rmdirAsync = (path, callback) => {
    winston.log('info', 'Deleting files');
    fs.readdir(path, (err, files) => {
      if (err) {
        winston.log('error', `Error occurred during reading directory ${path}, error message ${err}`);
      }

      var wait = files.length,
        count = 0,
        folderDone = function(err) {
          count++;
          // If we cleaned out all the files, continue
          if( count >= wait || err) {
            fs.rmdir(path,callback);
          }
        };
      // Empty directory to bail early
      if(!wait) {
        folderDone();
        return;
      }

      // Remove one or more trailing slash to keep from doubling up
      path = path.replace(/\/+$/,"");
      files.forEach(function(file) {
        var curPath = path + "/" + file;
        fs.lstat(curPath, function(err, stats) {
          if( err ) {
            callback(err, []);
            return;
          }
          if( stats.isDirectory() ) {
            rmdirAsync(curPath, folderDone);
          } else {
            verboseDebug(`Removing ${curPath}`);
            fs.unlink(curPath, folderDone);
          }
        });
      });
    });
  };

  debug('cleanup started');
  rmdirAsync(path, (err) => {

    if (err) {
      winston.log('error', `Error occurred during deletion of the directory "${path}". Error message: ${err}`);
    }

    winston.log('info', `Upload directory "${path}" is removed...`);
    debug('cleanup finished');
  });
}
