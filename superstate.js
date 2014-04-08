var _ = require('underscore');

var superstate = module.exports = {};

function serialize(data) {
  var string = JSON.stringify(data);
  var buffer = new Buffer(string);
  var base64 = buffer.toString('base64');
  return base64;
}

function deserialize(base64) {
  var buffer = new Buffer(base64, 'base64')
  var string = buffer.toString();
  var data = JSON.parse(string);
  return data;
}

function CookieCutter(doc) {
  if (!doc) doc = {};
  if (typeof doc === 'string') doc = { cookie: doc };
  if (doc.cookie === undefined) doc.cookie = '';
  
  var self = {};
  self.get = function (key) {
    var splat = doc.cookie.split(/;\s*/);
    for (var i = 0; i < splat.length; i++) {
      var ps = splat[i].split('=');
      var k = unescape(ps[0]);
      if (k === key) return unescape(ps[1]);
    }
    return undefined;
  };
  
  self.set = function (key, value, opts) {
    if (!opts) opts = {};
    var s = escape(key) + '=' + escape(value);
    if (opts.expires) s += '; expires=' + opts.expires;
    // path is not well-respected on chrome when escaped
    if (opts.path) s += '; path=' + opts.path;
    // if (opts.path) s += '; path=' + escape(opts.path);
    doc.cookie = s;
    return s;
  };

  return self;
}

var commonMethods = {

  get: function get(key) {
    return this.getState()[key];
  },

  set: function set(key, val) {
    var state = this.getState();
    state[key] = val;
    this.setState(state);
  }

};

superstate.browser = function(document, stateName) {

  var superstate = this;

  var browserCookie = CookieCutter(document);

  var currentCookie = browserCookie.get(stateName);

  var state = currentCookie ? deserialize(currentCookie) : {};

  this.setState = function setState(data) {
    state = data;
    currentCookie = serialize(data);
    var cookieOpts = {
      path: '/'
    };
    browserCookie.set(stateName, currentCookie, cookieOpts);
  }

  this.getState = function getState() {
    return state;
  }

  _.each(commonMethods, function(method, methodName) {
    superstate[methodName] = method.bind(superstate);
  });

  return superstate;
}

superstate.express = function(req, res, stateName) {

  var superstate = this;

  var currentCookie = req.cookies[stateName];

  var state = currentCookie ? deserialize(currentCookie) : {};

  this.setState = function setState(data) {
    state = data;
    currentCookie = serialize(data);
    res.cookie(stateName, currentCookie);
  }

  this.getState = function getState() {
    return state;
  }

  _.each(commonMethods, function(method, methodName) {
    superstate[methodName] = method.bind(superstate);
  });

  return superstate;
}


