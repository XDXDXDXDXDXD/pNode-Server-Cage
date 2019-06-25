const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'dev';
const config = require('./config')[env];

const app = express();

// Bootstrap db connection
var promise = mongoose.connect(config.db, {
  useMongoClient: true
});

mongoose.Promise = global.Promise;

// Bootstrap models
const models_path = __dirname + '/model'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
});

app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(config.app.hport, function(){
	console.log('HTTP Server Listening on port %d', config.app.hport);
	console.log('WS Server Listening on port %d', config.app.wsport);
});

/**
 * WebSocket Server
**/

const WebSocket = require('ws').Server;

var port = config.app.wsport;
var ws = new WebSocket({port: port});

ws.on('connection', function(w){

    w.on('message', function(data){
        ws.clients.forEach(function each(client) {
            if (client !== w) {
            client.send(data);
        }
        });
      console.log('message from client :', data);
    });

    w.on('close', function() {
        console.log('closing connection');
    });
});

/**
 * Helper Functions
**/

function randInt(){
	return Math.floor(Math.random() * arr.length);
}
