'use strict';

var app = require('../..');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const expect = require('chai').expect;

describe('Image API:', function () {

  describe('GET /api/image', function () {
    var images;

    beforeEach(function (done) {
      request(app)
        .get('/api/image')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          images = res.body;

          done();
        });
    });

    it('should respond with JSON array', function () {
      expect(images).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/image', function () {

    this.timeout(60000);
    let server;
    const serverPort = 9000;

    before(done => {
      server = app.listen(serverPort, done);
    });

    after(done => {
      server.close(done);
    });

    const formData = new FormData();
    formData.getLengthSync = null;
    const file = fs.createReadStream(__dirname + '/test/original.png');
    formData.append('file', file);

    const postImage = () =>
      fetch(`http://localhost:${serverPort}/api/image`, {method: 'POST', body: formData})
        .then(response => response.ok ?
          response.json() :
          Promise.reject(new Error('cannot post image')));

    it.only('uploads image', () =>
      postImage()
        .then((response) => {
          expect(response).to.be.an('object');
        })
    );
  });

});
