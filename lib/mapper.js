
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
  var appEvents = settings.appEvents;
  if (appEvents && appEvents[eventName] && (appEvents[eventName]!=="null") ) {
    eventName = appEvents[eventName];
  }

  // Facebook App Events will error if there's a period in the event name
  // so we replace all periods with underscores
  if (eventName.indexOf('.') !== -1) {
    eventName = eventName.split('.').join('_');
  }

  // Facebook App Events cannot receive events with names >= 40 characters
  // so we truncate
  if (eventName.length > 40) {
    eventName = eventName.substring(0, 40);
  }

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, eventName)
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
    event: 'MOBILE_APP_INSTALL'
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
    customParams(msg, eventName)
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
    customParams(msg, eventName)
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
    customParams(msg, eventName)
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
    customParams(msg, eventName)
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
    customParams(msg, eventName)
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
    customParams(msg, eventName)
  ));
}

/**
 * Map Order Started
 * @param {Track} msg
 * @param {Object} settings
 * @return {Object}
 */

exports.checkoutStarted = function(msg, settings){
  var eventName = "fb_mobile_initiated_checkout";

  return reject(extend(
    addContext(msg, settings),
    customParams(msg, eventName)
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
    customParams(msg, eventName)
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
    advertiser_id: msg.proxy('context.device.advertisingId'),
    advertiser_tracking_enabled: adTrackingEnabled ? 1 : 0,
    // We don't have a spec for something in addition to `adTrackingEnabled` to
    // indicate the user opt out status. If an app has a dedicated setting to opt
    // out beyond the device level setting, it can override what our SDK collects and
    // send it's own value for adTrackingEnabled.
    application_tracking_enabled: adTrackingEnabled ? 1 : 0
  };

  if (app.namespace) context.bundle_id = app.namespace;
  if (app.version) context.bundle_short_version = app.version;

  return context;
};

/**
 * Add Custom Events Parameters to payload
 *
 * @param {Facade} msg
 * @param {Object} settings
 */

function customParams(msg, eventName){
  var renames = {
    revenue: '_valueToSum',
    price: '_valueToSum',
    currency: 'fb_currency',
    name: 'fb_description',
    id: 'fb_content_id',
    category: 'fb_content_type'
  };
  var properties = msg.properties(renames);
  var customEvents = {
      _appVersion: msg.proxy('context.app.version'),
      _eventName: eventName,
      _logTime: time(msg.timestamp()),
      fb_search_string: msg.proxy('properties.query'),
      fb_num_items: numberOfItems(msg),
      fb_content_id: contentIds(msg)
  };
  delete properties.query;
  delete properties.quantity;
  delete properties.products;
  extend(customEvents, properties);

  // If message contains content_id or content_type in integrations.facebook object
  // Then use the values that they explicitly include
  var facebookOptions = msg.proxy('integrations.facebook') || {};
  if (facebookOptions.content_id) customEvents.fb_content_id = facebookOptions.content_id;
  if (facebookOptions.content_type) customEvents.fb_content_type = facebookOptions.content_type;

  if (!customEvents.fb_search_string) delete customEvents.fb_search_string;
  if (!customEvents.fb_content_id) delete customEvents.fb_content_id;
  if (!customEvents.fb_num_items) delete customEvents.fb_num_items;

  var params = {
    event: "CUSTOM_APP_EVENTS",
    custom_events: [customEvents]
  };

  return params;
}

/**
 * Calculate the Number of Items
 *
 * @param {Facade} msg
 */

function numberOfItems(msg) {
  var quantity = msg.proxy('properties.quantity');
  var products = msg.proxy('properties.products');
  if (quantity) {
    return quantity;
  }
  if (products) {
    var quantities = extractValue(products, 'quantity');
    return foldl(function(quantity, value) {
      return quantity + value;
    }, 0, quantities);
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
    return extractValue(products, 'id');
  }
}

/**
 * Return array of values from the array of products at a given key
 *
 * @param {Array} products
 */

function extractValue(products, key) {
  return foldl(function(results, product) {
    if (product[key]) return results.concat(product[key]);
    return results;
  }, [], products);
}
