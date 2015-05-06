var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  help_request: {type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"},
  subject:String,
  raw: Buffer
});

schema.pre("save",function(schema,next){
  next();
});

var SnapShot = mongoose.model('SnapShot', schema);
module.exports = SnapShot;
