var path = require('path');
var rootPath = path.normalize(__dirname);
var http_port = 3000;
var ws_port = 3333;

module.exports = {
  dev: {
      db: 'mongodb://localhost/wsnc',
      root: rootPath,
      app: {
        hport: http_port,
        wsport: ws_port,
        host:'http://localhost:'+http_port+'/',
        ws:'ws://localhost:'+ws_port,
        name: 'WSNC',
        secret: 'p8Mk).MgY}=Er:E8fS%bk^4W4qDD6LsF'
      }
  },
  prod: {
      hport: http_port,
      wsport: ws_port,
      db: 'mongodb://localhost/wsnc',
      root: rootPath,
      app: {
        host:'http://192.168.0.100:'+http_port+'/',
        ws:'ws://192.168.0.100:'+ws_port,
        name: 'WSNC',
        secret: 'p8Mk).MgY}=Er:E8fS%bk^4W4qDD6LsF'
      }
  }
}
