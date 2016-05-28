
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
  var eventName = msg.event();

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
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

  return reject(extend(
    payload,
    addContext(msg, settings)
  ));
}


/**
 * Map Application Opened
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.applicationOpened = function(msg, settings){
  var eventName = "fb_mobile_activate_app";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Products Searched
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productsSearched = function(msg, settings){
  var eventName = "fb_mobile_search";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Product Viewed
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productViewed = function(msg, settings){
  var eventName = "fb_mobile_content_view";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Product Added To Wishlist
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productAddedToWishlist = function(msg, settings){
  var eventName = "fb_mobile_add_to_wishlist";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Product Added To Cart
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.productAdded = function(msg, settings){
  var eventName = "fb_mobile_add_to_cart";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Payment Info Added
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.paymentInfoAdded = function(msg, settings){
  var eventName = "fb_mobile_add_payment_info";

  return reject(extend(
    {custom_events:{fb_success: 1}},
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Order Started
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.orderStarted = function(msg, settings){
  var eventName = "fb_mobile_initiated_checkout";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
}

/**
 * Map Order Completed
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.orderCompleted = function(msg, settings){
  var eventName = "fb_mobile_purchase";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, settings, eventName)
  ));
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

function customParams(msg, settings, eventName){
  var renames = {
    revenue: '_valueToSum',
    price: '_valueToSum',
    currency: 'fb_currency',
    name: 'fb_description',
    id: 'fb_content_id',
    query: 'fb_search_string',
    category: 'fb_content_type'
  };
  var properties = msg.properties(renames);
  var params = {
    event: "CUSTOM_APP_EVENTS",
    custom_events: {
      _eventName: eventName,
      _logTime: time(msg.timestamp()),
      fb_num_items: msg.proxy('properties.quantity'),
      // fb_num_items: numberOfItems(msg),
      fb_search_string: msg.proxy('properties.query')
    }
  };
  delete properties.query;
  delete properties.quantity;
  extend(params.custom_events, properties);
  console.log('woo!', params);

  return params;
}

/**
 * Calculate the Number of Items
 *
 * @param {Facade} msg
 */

function numberOfItems(msg) {
  var products = msg.proxy('properties.products');
  if (msg.proxy('properties.quantity')) {
    return msg.proxy('properties.quantity');
  } 
  if (products) {
    foldl(function(results, product) {
      if (product.quantity) {
        return results + product.quantity;
      } else {
        return results + 1;
      }
      return results;
    }, 0, products);
    return products.length;
  } 
}

/**
 * Populate content_id parameter with the id from the event if there's one
 * id and with an array if there are multiple.
 *
 * @param {Facade} msg
 */

function contentIds(msg) {
  var products = msg.proxy('properties.products');
  if (products) {
    foldl(function(results, product) {
      if (product.id) {
        return product.id;
      }
      return results;
    }, [], products); 
  }
}
