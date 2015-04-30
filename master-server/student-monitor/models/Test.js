var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  parent: mongoose.Schema.Types.ObjectId,
  subject:String,
  score: Number,
  total:Number,
  raw: Buffer
});

schema.statics.fromObject = function(parent,user,subject,obj,next){
  this.create({
    user:user,
    parent:parent,
    subject:subject,
    score: obj.stats.passes/obj.stats.tests,
    total:obj.stats.tests,
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

var Test = mongoose.model('Test', schema);
module.exports = Test;
