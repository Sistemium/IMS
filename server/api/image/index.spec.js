'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var imageCtrlStub = {
  get: 'imageCtrl.get',
  post: 'imageCtrl.post'
};

var routerStub = {
  get: sinon.spy(),
  post: sinon.spy()
};

// require the index with our stubbed out modules
var imageIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './image.controller': imageCtrlStub
});

describe('Image API Router:', function () {

  it('should return an express router instance', function () {
    expect(imageIndex).to.equal(routerStub);
  });

  describe('GET /api/image', function () {

    it('should route to image.controller.get', function () {
      expect(routerStub.get
        .withArgs('/', imageCtrlStub.get)
      ).to.have.been.calledOnce;
    });

  });

});
