var _ = require('underscore');
var BrowserCookies = require('cookies-js');

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

  var currentCookie = BrowserCookies.get(stateName);

  var state = currentCookie ? deserialize(currentCookie) : {};

  this.setState = function setState(data) {
    state = data;
    currentCookie = serialize(data);
    BrowserCookies.set(stateName, currentCookie);
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