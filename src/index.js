// Inspired by https://github.com/MatteoGabriele/vue-analytics

/**
 * Configuration
 * @type {Object}
 */
const config = {
  debug: false,
  excludes: [],
};

const standardEvents = [
  "addpaymentinfo",
  "addtocart",
  "addtowishlist",
  "completeregistration",
  "contact",
  "customizeproduct",
  "donate",
  "findlocation",
  "initiatecheckout",
  "lead",
  "pageview",
  "purchase",
  "schedule",
  "search",
  "starttrial",
  "submitapplication",
  "subscribe",
  "viewcontent",
];

// Private functions

const _fbqEnabled = () => {
  if (typeof window.fbq === "undefined") {
    if (config.debug) {
      console.log(
        "[Vue Facebook Pixel]: `window.fbq` is not defined, skipping"
      );
    }

    return false;
  }

  return true;
};

// Public functions

/**
 * Init facebook tracking pixel
 * @param  {String} appId
 * @param  {object} [data={}]
 */
const init = (appId, data = {}) => {
  if (!_fbqEnabled()) return;

  if (config.debug) {
    console.log(`[Vue Facebook Pixel] Initializing app ${appId}`);
  }

  query("init", appId, data);
};

/**
 * Event tracking
 * @param  {String} name
 * @param  {object} [data={}]
 */
const event = (name, data = {}) => {
  if (!_fbqEnabled()) return;

  if (config.debug) {
    console.groupCollapsed(`[Vue Facebook Pixel] Track event "${name}"`);
    console.log(`With data: ${data}`);
    console.groupEnd();
  }

  if (!standardEvents.includes(name.toLowerCase()))
    query("trackCustom", name, data);
  else query("track", name, data);
};

/**
 * Submit a raw query to fbq, for when the wrapper limits user on what they need.
 * This makes it still possible to access the plain Analytics api.
 * @param mixed ...args
 */
const query = (...args) => {
  if (!_fbqEnabled()) return;

  if (config.debug) {
    console.groupCollapsed(`[Vue Facebook Pixel] Raw query`);
    console.log(`With data: `, ...args);
    console.groupEnd();
  }

  window.fbq(...args);
};

/**
 * Vue installer
 * @param  {Vue instance} Vue
 * @param  {Object} [options={}]
 */
const install = (app, options = {}) => {
  //
  const { router, debug, excludeRoutes } = options;

  config.excludes = excludeRoutes || config.excludes;
  config.debug = !!debug;

  // These objects may contain different providers as well,
  // or might be empty:
  if (!app.analytics) {
    app.analytics = {};
  }

  if (!app.config.globalProperties.$analytics) {
    app.config.globalProperties.$analytics = {};
  }

  // Setting values for both Vue and component instances
  // Usage:
  // 1. `Vue.analytics.fbq.init()`
  // 2. `this.$analytics.fbq.init()`

  app.analytics.fbq = { init, event, query };
  app.config.globalProperties.$analytics.fbq = { init, event, query };

  // Support for Vue-Router:
  if (router) {
    const { excludes } = config;

    router.afterEach(({ path, name }) => {
      if (excludes.length && excludes.indexOf(name) !== -1) {
        return;
      }

      app.analytics.fbq.event("PageView");
    });
  }
};

export default { install };
