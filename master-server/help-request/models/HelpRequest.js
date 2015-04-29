var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  description:String,
  snapshot: {type: mongoose.Schema.Types.ObjectId, ref:"SnapShot"},
  taken: Boolean
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
