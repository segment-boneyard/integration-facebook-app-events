
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
    event: 'CUSTOM_APP_EVENTS'
  };

  extend(payload, addContext(msg, settings));
  payload.custom_events = customParams(msg, settings);

  return reject(payload);
};

/**
 * Map Application Installed
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.applicationInstalled = function(msg, settings){
  var payload = {
    event: 'App Install'
  };
  extend(payload, addContext(msg, settings));

  return reject(payload);
}


/**
 * Map Application Opened
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.applicationOpened = function(msg, settings){
  var payload = {
    event: 'Launched App'
  };
  extend(payload, addContext(msg, settings));

  return reject(payload);
}

/**
 * Map Products Searched
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productsSearched = function(msg, settings){
  var payload = {
    event: 'Searched'
  };
  extend(payload, addContext(msg, settings));
  payload.SearchString = msg.proxy('properties.query');

  return reject(payload);
}

/**
 * Map Product Viewed
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productViewed = function(msg, settings){
  var payload = {
    event: 'Viewed Content'
  };
  extend(payload, addContext(msg, settings));
  extend(payload, productParams(msg, settings));

  return reject(payload);
}

/**
 * Map Product Added To Wishlist
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productAddedToWishlist = function(msg, settings){
  var payload = {
    event: 'Added to Wishlist'
  };
  extend(payload, addContext(msg, settings));
  extend(payload, productParams(msg, settings));

  return reject(payload);
}

/**
 * Map Product Added To Cart
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productAdded = function(msg, settings){
  var payload = {
    event: 'Added to Cart'
  };
  extend(payload, addContext(msg, settings));
  extend(payload, productParams(msg, settings));

  return reject(payload);
}

/**
 * Map Payment Info Added
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.paymentInfoAdded = function(msg, settings){
  var payload = {
    event: 'Added Payment Info'
  };
  extend(payload, addContext(msg, settings));
  payload.payment_method = msg.proxy('properties.payment_method');

  return reject(payload);
}

/**
 * Map Order Started
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.orderStarted = function(msg, settings){
  var payload = {
    event: 'Initiated Checkout'
  };
  extend(payload, addContext(msg, settings));
  extend(payload, productParams(msg, settings));

  return reject(payload);
}

/**
 * Map Order Completed
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.orderCompleted = function(msg, settings){
  var payload = {
    event: 'Purchased'
  };
  extend(payload, addContext(msg, settings));
  extend(payload, productParams(msg, settings));

  return reject(payload);
}


/*
 * Add Context params to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function addContext(msg, settings){
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

function customParams(msg, settings){
  var event = msg.event();

  var params = {
    _eventName: event,
    _valueToSum: msg.revenue() || msg.price(),
    _logTime: time(msg.timestamp()),
    // facade.currency() defaults to 'USD', which we want to avoid
    // if event is e-commerce related
    fb_currency: msg.proxy('properties.currency'),
    fb_description: msg.proxy('properties.description'),
    fb_search_string: msg.proxy('properties.query'),
    fb_content_type: msg.proxy('properties.category'),
    fb_content_id: msg.proxy('properties.id')
  };

  return params;
}

/**
 * Add Product Event Parameters to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function productParams(msg, settings){
  var products = msg.proxy('properties.products');
  var params = {
    ContentID: msg.proxy('properties.id'),
    ContentType: msg.proxy('properties.category'),
    Description: msg.proxy('properties.description'),
    Currency: msg.proxy('properties.currency'),
    valueToSum: msg.revenue() || msg.price(),
    numberOfProducts: products ? products.length : null
  };
  return params;
}
