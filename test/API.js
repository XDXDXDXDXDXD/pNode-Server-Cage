const request = require('request');

const env = process.env.NODE_ENV || 'dev';
const config = require('../config')[env];
var day = 0;

const host = config.app.host;
//Data needed to crate the device in the db
var node = {
    name: "DeviceName",
    active: false,
    lastUpdate: Date(),
    location: "DeviceLocation",
    password: "DevicePassword"
};

//Data saved on the device
var meta = {
    name:node.name,
    key:node.password,
    token:"",
    tokenExpire:"",
    serverTime:""
}

//Create Device, Save Token
createDevice(node, function(d){
    meta.token = d.token;
    meta.tokenExpire = d.expire;
    meta.serverTime = d.serverTime;
    console.log("Adding new device with id: %s", meta.name);
    console.log(meta);
});

function simulateDevice(){
    var randInt = Math.floor(Math.random()*2);
    motion = randInt > 0 ? 0 : 1;
    if(!checkTokenDate(meta)){
        sendUpdates(meta, motion, function(message){
            meta.serverTime = message.serverTime;
            console.log("receiving updates from server at time %d", meta.serverTime)
        });
    }
}

setInterval(simulateDevice, 1000); // check every 10s


/**
 * Helper Functions
**/
function sendUpdates(device, motion, callback){
    var options = {
        url: host+'api/update/'+device.name+'?m='+motion,
        headers: {
            'x-access-token': device.token
        }
    };
    request.get(options, function(err, response, body){
        if (!err && response.statusCode == 200) {
            var message = JSON.parse(body);
            return callback(message);
          }
        if(err) console.error(err);
    });
}

function checkTokenDate(device){
    console.log(device.tokenExpire - device.serverTime)
    if(device.tokenExpire - device.serverTime <= 10000){
        console.log("TOKEN EXPIRED: renewing token at time %d", device.serverTime)
        console.log("DAY %d", day++)
        renewToken(device);
    }
    else
        return false;
}


function renewToken(device){
    var form = {};
    form.password = device.key;
    request.post({url:host+'api/renew/'+device.name, form: form}, function(err,httpResponse,body){
        if (!err && httpResponse.statusCode == 200){
            console.log("New device token acquired.")
            d = JSON.parse(body);
            device.token = d.token;
            device.tokenExpire = d.expire;
            device.serverTime = d.serverTime;
        }
        else  console.error(err);
     });
}

function createDevice(device, callback){
    request.post({url:host+'api/devices', form: device}, function(err,httpResponse,body){
        if (!err && httpResponse.statusCode == 200){
            device = JSON.parse(body);
            return callback(device);
        }
        else  console.error(err);
     });
}
