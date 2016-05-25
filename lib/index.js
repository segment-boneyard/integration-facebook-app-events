
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var fmt = require('util').format;
var mapper = require('./mapper');
var crypto = require('crypto');
var is = require('is');
var qs = require('qs');


/**
 * Expose `Facebook App Events`
 *
 * https://developers.facebook.com/docs/marketing-api/app-event-api/v2.6
 */

var FacebookAppEvents = module.exports = integration('Facebook App Events')
  .endpoint('https://graph.facebook.com/2.6/')
  .channels(['server'])
  .ensure('settings.appId')
  .ensure('settings.advertiserId')
  .retries(2);

/**
 * Track.
 *
 * https://developers.facebook.com/docs/marketing-api/app-event-api/v2.6
 *
 * @param {Track} track
 * @param {Function} callback
 * @api public
 */

FacebookAppEvents.prototype.track = function(track, callback){
  var payload = mapper.track(track, this.settings);
  return this
    .post(this.settings.appId + '/activities')
      .send(payload)
      .type('json')
      .end(this.handle(callback));
};