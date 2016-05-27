
/**
 * Module dependencies.
 */

var reject = require('reject');
var extend = require('extend');
var foldl = require('@ndhoule/foldl');
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
  payload.search_string = msg.proxy('properties.query');

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
    // If these are disabled, these calls will never make it to our servers
    // so we can default to true
    advertiser_tracking_enabled: 1,
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
    currency: msg.proxy('properties.currency'),
    description: msg.proxy('properties.description') || msg.proxy('properties.name'),
    search_string: msg.proxy('properties.query'),
    content_type: msg.proxy('properties.category'),
    content_id: msg.proxy('properties.id')
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
    _valueToSum: msg.revenue() || msg.price(),
    _logTime: time(msg.timestamp()),
    content_type: msg.proxy('properties.category'),
    description: msg.proxy('properties.description') || msg.proxy('properties.name'),
    currency: msg.proxy('properties.currency'),
    number_of_products: products ? products.length : null
  };
  populateContentIds(msg, params, products);
  return params;
}

/**
 * Populate content_id parameter with the id from the event if there's one
 * id and with an array if there are multiple.
 *
 * @param {Facade} msg
 * @param {Object} params
 * @param {Array} products
 */

function populateContentIds(msg, params, products) {
  if (products) {
    foldl(function(results, product) {
      if (product.id) {
        return product.id;
      }
      params.content_id = results;
    }, [], products); 
  } else {
    params.content_id = msg.proxy('properties.id');
  }
}
