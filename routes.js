const devices = require('./controller/devices');
const sim = false;

module.exports = function(app){
    //General Routes
    app.get("/", function(req, res){
        res.sendFile(__dirname + '/public/index.html');
    });

    //Devices Routes
    app.post('/api/devices',devices.create);
    app.get('/api/devices/',devices.readAll);
    app.get('/api/devices/:name',devices.singleRead);

    app.post('/api/renew/:name', devices.renew);
    app.get('/api/update/:name',devices.verifyToken, devices.update);

    setInterval(devices.checkStatus, 90000); // check every 1.5min 90000

    // Handle 404
    app.use(function(req, res) {
        res.status(404);
        res.json({"err":"404"});
    });

    // Handle 500
    app.use(function(error, req, res, next) {
        res.status(500);
        res.json({"err":"500","error":error});
    });
    if(sim)
        setInterval(devices.simulateNetwork, 2000);

}
