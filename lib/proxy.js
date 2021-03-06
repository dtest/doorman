var httpProxy = require('http-proxy');
var conf = require('./config');
var log = require('./log');

var Proxy = module.exports = function(host, port, toProxy) {
  this.host = host;
  this.port = port;
  this.target = "http://" + this.host + ":" + this.port;
  this.toProxy = toProxy || false
  this.proxy = httpProxy.createProxyServer({xfwd: true, toProxy: this.toProxy });
};

Proxy.prototype.middleware = function() {
  var self = this;

  return function (req, res, next) {
    self.proxy.web(req, res, {
      target: self.target
    }, function(err) {
      if(err) {
        log.error("Backend error: " + err.message);
        if(req.session) { req.session.flash = null; }
        req.flash('error', 'There was an error with the backend service.');
        next();
      }
    });
  }
}

Proxy.prototype.proxyWebSocketRequest = function(req, socket, head) {
  this.proxy.ws(req,
                socket,
                head,
                { target: this.target });
};
