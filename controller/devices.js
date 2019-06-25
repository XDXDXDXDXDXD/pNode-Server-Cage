const env = process.env.NODE_ENV || 'dev';
const config = require('../config')[env];

const WebSocket = require('ws');

exports.update = function(req, res) {
    var name = req.params.name;
    var motion = req.query.m;
    if(motion == 1){
        console.log("Motion detected %d from %s", new Date(), name)
        const ws = new WebSocket(config.app.ws);
        ws.on('open', function open() {
            var message = {};
            message.act = "m";
            message.dev_id = name;
            ws.send(JSON.stringify(message));
        });

        }
    else if(motion == 0){
        console.log("Heartbeat %d from %s", new Date(), name)
        }
}

exports.simulateNetwork = function(){
    var names = ["0x0001","0x0002","0x0003","0x0004","0x0005","0x0007","0x0008","0x0009","0x000A","0x000B","0x000C","0x000D"];
    var rand = getRandomInt(names.length);
    console.log("Motion detected %d from %s", new Date(), names[rand])
    const ws = new WebSocket(config.app.ws);
    ws.on('open', function open() {
        var message = {};
        message.act = "m";
        message.dev_id = names[rand];
        ws.send(JSON.stringify(message));
    });

}


/*Helper functions*/

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
