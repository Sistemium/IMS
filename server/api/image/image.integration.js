'use strict';

var app = require('../..');
import request from 'supertest';

describe('Image API:', function() {

  describe('GET /api/image', function() {
    var images;

    beforeEach(function(done) {
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

    it('should respond with JSON array', function() {
      expect(images).to.be.instanceOf(Array);
    });

  });

});
