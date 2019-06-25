var Server = require('ws').Server;
var port = 3333;
var ws = new Server({port: port});

ws.on('connection', function(w){
    
    w.on('message', function(msg){
      console.log('message from client :: ', msg);
    });

    w.send('message to client');

    w.on('close', function() {
        console.log('closing connection');
    });

});
