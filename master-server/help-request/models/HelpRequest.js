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

schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  if(req.method === "GET"){
    return next(req.user.permissions.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    return next(req.user.permissions.indexOf("student") !== -1);
  }
  return next(false);
};


var SnapShot = mongoose.model('SnapShot', schema);
module.exports = Test;
