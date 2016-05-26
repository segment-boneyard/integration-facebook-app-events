
/**
 * Module dependencies.
 */

var reject = require('reject');
var extend = require('extend');
var is = require('is');
var time = require('unix-time');

/**
 * Map track.
 *
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.track = function(msg, settings){
  var event = msg.event();
  var appEvent = this.appEvents(event);

  var payload = { 
    event: 'CUSTOM_APP_EVENTS'
  };
  
  extend(payload, addContext(msg, settings));
  // Set event name equal to mapped name if present
  if (appEvent) event = appEvent;

  payload.custom_events = addParams(msg, settings, event);

  return reject(payload);
};

/*
 * Add Context params to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function addContext(msg, settings) {
  var adTrackingEnabled = msg.proxy('context.device.adTrackingEnabled');
  var app = msg.proxy('context.app');

  var context = {
    advertiser_id: msg.proxy('context.device.idfa') || msg.proxy('context.device.advertisingId'),
    advertiser_tracking_enabled: (adTrackingEnabled === false) ? 0 : 1,
    // We don't have a spec'd field for this yet so it defaults to enabled
    application_tracking_enabled: 1
  };

  if (app.namespace) context.bundle_id = app.namespace;
  if (app.version) context.build_version = app.version;

  return context;
};

/**
 * Add Custom Events Parameters to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function addParams(msg, settings, event) {
  var params = {
    _eventName: event,
    _valueToSum: msg.revenue() || msg.price(),
    _logTime: time(msg.timestamp()),
    // facade.currency() defaults to 'USD', which we want to avoid
    // if event is e-commerce related
    fb_currency: msg.proxy('properties.currency'),
    fb_description: msg.description,
    search_string: msg.query
  };

  return params;
}
