
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var FacebookAppEvents = require('..');
var mapper = require('../lib/mapper');

describe('Facebook App Events', function(){
  var settings;
  var facebookAppEvents;
  var test;

  beforeEach(function(){
    settings = {
      appId: '654757884637545',
      appEvents: { 'Levelled Up': 'fb_mobile_level_achieved' }
    };
  });

  beforeEach(function(){
    facebookAppEvents = new FacebookAppEvents(settings);
    test = Test(facebookAppEvents, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Facebook App Events')
      .endpoint('https://graph.facebook.com/')
      .channels(['server'])
      .ensure('settings.appId');
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Character Upgraded',
        timestamp: new Date(),
        context: {
          app: {
            namespace: 'com.Segment.testApp',
            version: 1.0
          },
          device: {
            type: 'ios',
            advertisingId: '123456',
            adTrackingEnabled: 1
          }
        }
      };
    });

    it('should be invalid when .advertisingId is missing', function(){
      delete msg.context.device.advertisingId;
      test.invalid(msg, settings);
    });

    it('should be invalid when .appId is missing', function(){
      delete settings.appId;
      test.invalid(msg, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){
    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });
    });

    describe('custom track', function(){
      it('should map custom track', function(){
        test.maps('track-custom-mapped');
      });
    });

    describe('custom track with a period in the name', function(){
      it('should map custom track with a period in the name', function(){
        test.maps('track-custom-period');
      });
    });

    describe('Application Installed', function() {
      it('should map Application Installed', function(){
        test.maps('track-app-install');
      })
    });

    describe('Application Opened', function() {
      it('should map Application Opened', function(){
        test.maps('track-app-opened');
      })
    });

    describe('Products Searched', function() {
      it('should map Products Searched', function(){
        test.maps('track-search');
      })
    });

    describe('Products Viewed', function() {
      it('should map Products Viewed', function(){
        test.maps('track-ecommerce-viewed-product');
      })
    });

    describe('Product Added To Wishlist', function() {
      it('should map Product Added To Wishlist', function(){
        test.maps('track-ecommerce-wishlisted-product');
      })
    });

    describe('Product Added To Cart', function() {
      it('should map Product Added To Cart', function(){
        test.maps('track-ecommerce-added-product');
      })
    });

    describe('Payment Info Added', function() {
      it('should map Payment Info Added', function(){
        test.maps('track-ecommerce-payment-info');
      })
    });

    describe('Checkout Started', function() {
      it('should map Checkout Started', function(){
        test.maps('track-ecommerce-checkout-started');
      })
    });

    describe('Completed Order', function() {
      it('should map Completed Order', function(){
        test.maps('track-ecommerce-completed-order');
      })
    });

  });

  describe('track', function(){

    it('should track basic correctly', function(done){
      var json = test.fixture('track-basic');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track custom correctly', function(done){
      var json = test.fixture('track-custom-mapped');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track custom events with a period correctly', function(done){
      var json = test.fixture('track-custom-period');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Installed correctly', function(done){
      var json = test.fixture('track-app-install');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Opened correctly', function(done){
      var json = test.fixture('track-app-opened');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Products Searched correctly', function(done){
      var json = test.fixture('track-search');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Products Viewed correctly', function(done){
      var json = test.fixture('track-ecommerce-viewed-product');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Products Wishlisted correctly', function(done){
      var json = test.fixture('track-ecommerce-wishlisted-product');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Payment Info Added correctly', function(done){
      var json = test.fixture('track-ecommerce-payment-info');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Checkout Started correctly', function(done){
      var json = test.fixture('track-ecommerce-checkout-started');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should track Order Completed correctly', function(done){
      var json = test.fixture('track-ecommerce-completed-order');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });
});
