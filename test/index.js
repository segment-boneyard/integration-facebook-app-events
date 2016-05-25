
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
      advertiserId: '159358',
      appId: '1553537634940964'
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
      .ensure('settings.appId')
      .ensure('settings.advertiserId');
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        context: {
          app: {
            namespace: 'com.Segment.testApp'
          },
          device: {
            type: 'ios'
          }
        }
      };
    });

    it('should be invalid when .advertiserId is missing', function(){
      delete settings.appId;
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
});
