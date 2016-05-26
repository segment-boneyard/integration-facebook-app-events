
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var FacebookAppEvents = require('..');

describe('Facebook App Events', function(){
  var settings;
  var facebookAppEvents;
  var test;

  beforeEach(function(){
    settings = {
      appId: '159358'
    };
  });

  beforeEach(function(){
    facebookAppEvents = new FacebookAppEvents(settings);
    test = Test(facebookAppEvents, __dirname);
  });

  it('should have the correct settings', function(){
    test
      .name('Facebook App Events')
      .endpoint('https://graph.facebook.com/2.6/')
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
            advertiserId: '123456',
            adTrackingEnabled: 1
          }
        }
      };
    });

    it('should be invalid when .advertiserId is missing', function(){
      delete msg.context.device.advertiserId;
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
    describe('Application Opened', function() {
      it('should map Application Opened', function(){
        test.maps('track-app-opened');
      })
    });
  });

  describe.skip('track', function(){

      it('should track basic correctly', function(done){
        var json = test.fixture('track-basic');
        test
          .track(json.input)
          .query(json.output)
          .expects(200)
          .end(done);
      });

      it('should track Application Opened correctly', function(done){
        var json = test.fixture('track-app-opened');
        test
          .track(json.input)
          .query(json.output)
          .expects(200)
          .end(done);
      });
  });
});
