var path = require('path');
var rootPath = path.normalize(__dirname);
var http_port = 3000;
var ws_port = 3333;

module.exports = {
  dev: {
      root: rootPath,
      app: {
        hport: http_port,
        wsport: ws_port,
        host:'http://localhost:'+http_port+'/',
        ws:'ws://localhost:'+ws_port,
        name: 'WSNC'
      }
  },
  prod: {
      hport: http_port,
      wsport: ws_port,
      root: rootPath,
      app: {
        host:'http://192.168.0.100:'+http_port+'/',
        ws:'ws://192.168.0.100:'+ws_port,
        name: 'WSNC'
      }
  }
}
