var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  help_request: {type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"},
  subject:String,
  raw: Buffer
});

schema.statics.fromObject = function(help_request,obj,next){
  this.create({
    user:help_request.user,
    help_request:help_request,
    subject:help_request.subject,
    raw:obj
  },next);
};


var SnapShot = mongoose.model('SnapShot', schema);
module.exports = Test;
