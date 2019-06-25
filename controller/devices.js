const mongoose = require('mongoose');

const Device = mongoose.model('Device');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const env = process.env.NODE_ENV || 'dev';
const config = require('../config')[env];

const WebSocket = require('ws');

exports.create = function(req, res){
    var data = req.body;

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    data.password = hashedPassword;
    var device = new Device(data);
    device.active = true;
    device.lastUpdate = Date();
    device.location = "R1";

    device.save(function(err){
        if(err) console.error(err);
        else {
            // create a token
            var token = jwt.sign({ id: device._id }, config.app.secret, {
                expiresIn: 84000
            });
            var expire = (new Date()).getTime() + 84000000;
            res.status(200).send(JSON.stringify({token:token,expire:expire,serverTime:(new Date()).getTime()}));
        }
    });
};

exports.update = function(req, res, next) {
    var name = req.params.name;
    var motion = req.query.m;
    var set_query = {}
    if(motion == 1){
        set_query = { active: true, lastUpdate: Date(), lastMotion: Date()};
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
        set_query = { active: true, lastUpdate: Date()};
        console.log("Heartbeat %d from %s", new Date(), name)
        }

    Device.update({ _id: req.device_id, name: name}, { $set: set_query }, { multi: false },
        function(err, device){
            if (err)
                return res.status(500).send('Error on the server.');
            if (!device)
                return res.status(404).send('No device found.');
            else{
                res.status(200).send(JSON.stringify({serverTime:(new Date()).getTime()}));
            }
    });
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

exports.checkStatus = function(){
    Device.find({active: true}, {password:0}, function(err, devices){
        if(err) console.error(err);
        else{
            for(var i = 0; i < devices.length; i++){
                var lastUpdate = new Date(devices[i].lastUpdate).getTime();

                if((new Date()).getTime() -  lastUpdate >= 60000){
                        console.log("changing status of %s to offline", devices[i].name);

                    Device.update({ _id: devices[i]._id}, { $set: {active: false} },
                        function(err, device){
                            if(err) console.error(err);
                    });
                }
            }
        }
    });
}

exports.renew = function(req, res, next) {

    var device_name = req.params.name;

    Device.findOne({ name: device_name }, function (err, device) {
    if (err)
        return res.status(500).send('Error on the server.');
    if (!device)
        return res.status(404).send('No device found.');
    if(req.body.password != undefined){
        var passwordIsValid = bcrypt.compareSync(req.body.password, device.password);
        if (!passwordIsValid)
            return res.status(401).send({ auth: false, token: null });
        else{
            //renew token
            var token = jwt.sign({ id: device._id }, config.app.secret, {
                expiresIn: 84000
            });
            var expire = (new Date()).getTime() + 84000000;
            res.status(200).send(JSON.stringify({token:token,expire:expire,serverTime:(new Date()).getTime()}));
        }
    }
    else{
        return res.status(404).send('No device found.');
    }
  });
}

exports.readAll = function(req, res){
    var skip = req.query.skip || 0;
    var limit = req.query.limit || 200;
    console.log(skip + " " + limit);
    Device.find(null,{password:0},{ skip: skip, limit: limit },function(err, devices){
        if(err) console.error(err);
        else{
            console.log("Read All Devices");
            return res.send(devices);
        }
    });
}

exports.singleRead = function(req, res){
  var name = req.params.name;
  var query = {"name": name};
  Device.findOne(query, {password:0},function(err, device){
      if(err) console.error(err);
      else{

          return res.send(device);
      }
  })
};

exports.verifyToken = function(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.app.secret, function(err, decoded) {

    if (err)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    req.device_id = decoded.id;
    next();
  });
}

/*Helper functions*/

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
