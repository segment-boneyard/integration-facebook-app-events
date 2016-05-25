
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

  var payload = { 
    event: 'CUSTOM_APP_EVENTS',
    advertiser_id: settings.advertiserId
  };
  
  extend(payload, addContext(msg, settings));

  payload.custom_events = addParams(msg, settings);

  return reject(payload);
};

/**
 * Add Custom Events Parameters to  payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function addParams(msg, settings) {

  var params = {
    _valueToSum: msg.revenue() || msg.price(),
    _logTime: time(msg.timestamp),
    // facade.currency() defaults to 'USD', which we want to avoid
    // if event is e-commerce related
    fb_currency: msg.proxy('properties.currency'),
    fb_description: msg.description,
    search_string: msg.query,
  };

  return params;
}

/*
 * Add Context params to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function addContext(msg, settings) {

  var sdk = msg.proxy('context.device.type') || 'server';

  var locale = msg.proxy('context.locale');

  var query = {
    advertiser_id: settings.advertiserId,
    // package_name required
    package_name: msg.proxy('context.app.namespace') || msg.proxy('context.app.name'),
    sdk: sdk,
    device_ip: msg.proxy('context.ip'),
    device_brand: msg.proxy('context.device.manufacturer'),
    device_model: msg.proxy('context.device.model'),
    device_carrier: msg.proxy('context.network.carrier'),
    language: msg.proxy('context.locale'),
    advertiser_ref_id: msg.proxy('context.referrer.id')
  };

  if (locale) {
    var code = locale.split('-')[1];
    if (code) query.country_code = code.toUpperCase();
  }

  switch (sdk) {
    case 'ios':
      query = ios(msg, query);
      break;
    case 'android':
      query = android(msg, query);
      break;
  }

  return query;
};

/**
 * Merge ios info.
 *
 * @param {Track} msg
 * @param {Object} query
 * @return {Object}
 */

function ios(msg, query){
  var refType = msg.proxy('context.referrer.type');
  query.iad_attribution = (refType === 'iad') ? 1 : 0;
  query.ios_ifa = msg.proxy('context.device.idfa') || msg.proxy('context.device.advertisingId');
  query.ios_ad_tracking = msg.proxy('context.device.adTrackingEnabled') ? 1 : 0;
  query.ios_ifv = msg.proxy('context.device.idfv');
  return query;
}

/**
 * Merge android info.
 *
 * @param {Track} msg
 * @param {Object} query
 * @return {Object}
 */

function android(msg, query){
  query.install_referrer = '';
  query.google_aid = msg.proxy('context.device.idfa') || msg.proxy('context.device.advertisingId');
  var adTrackingEnabled = msg.proxy('context.device.adTrackingEnabled');
  // only send adTrackingEnabled as false if it is explicitly set as false
  query.google_ad_tracking = (adTrackingEnabled === false) ? 0 : 1;
  // if the call is from the Segment Android SDK, device id = android id
  if (msg.proxy('context.library.name') == 'analytics-android') query.android_id = msg.proxy('context.device.id');
  return query;
}
