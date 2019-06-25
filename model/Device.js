var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deviceSchema = new Schema({
    name:  {type: String, index:{unique: true}, required: true},
    active: {type: Boolean},
    lastUpdate: {type: Date},
    lastMotion: {type: Date},
    location: {type: String},
    sceneId: {type: mongoose.Schema.Types.ObjectId},
    password: {type: String, require:true}
});

var Device = mongoose.model('Device', deviceSchema);
