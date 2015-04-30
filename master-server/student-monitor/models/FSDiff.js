var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  fs_type: {type:String,enum:["add","save","rem"]},
  subject:String,
  passedTests:Boolean,
  raw: Buffer
});


schema.statics.fromObject = function(obj){
  var diff = new FSDiff();
  var subject = obj.subject;
  Test.fromObject(diff,user,subject,obj.test,function(err,test){
    if(err) return console.error(err);
    diff.user = user;
    diff.test = test;
    diff.subject = subject;
    diff.passedTests = test.score === 1;
    diff.raw = obj.diff;
  });
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

schema.statics.defaultCreate = function(req){
  return {user:req.user._id};
};

var FSDiff = mongoose.model('FSDiff', schema);
module.exports = FSDiff;