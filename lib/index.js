
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
  .mapping('appEvents')
  .ensure('settings.appId')
  .retries(2);


/**
 * Ensure there's an advertiser id
 */


FacebookAppEvents.ensure(function(msg){
  var device = msg.proxy('context.device') || {};
  if (device.advertiserId) return;
  return this.invalid('All calls must have Ad Tracking Enabled and an Advertiser Id');
});

/**
 * Track.
 *
 * https://developers.facebook.com/docs/marketing-api/app-event-api/v2.6
 *
 * @param {Track} track
 * @param {Function} callback
 */

FacebookAppEvents.prototype.track = function(track, callback){
  var payload = mapper.track(track, this.settings);
  return this
    .post(this.settings.appId + '/activities')
      .send(payload)
      .type('json')
      .end(this.handle(callback));
};

/**
 * Completed Order
 *
 * https://developers.facebook.com/docs/marketing-api/app-event-api/v2.6
 *
 * @param {Track} track
 * @param {Function} callback
 */

FacebookAppEvents.prototype.applicationOpened = function(track, callback) {
  var payload = mapper.applicationOpened(track, this.settings);
  return this
    .post(this.settings.appId + '/activities')
    .send(payload)
    .type('json')
    .end(this.handle(callback));
}
