var mongoose = require("mongoose");
var Test = require("./Test");
var Schema = mongoose.Schema;

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  path: String,
  subject:String,
  fs_type: {type:String,enum:["add","save","rem"]},
  passedTests:Boolean,
  raw: String
});

schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  if(req.method === "GET"){
    return next(req.user.roles.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    return next(req.user.roles.indexOf("student") !== -1);
  }
  return next(false);
};

schema.statics.defaultCreate = function(req,next){
  next(void(0),{user:req.user._id});
};

schema.pre('validate', function(next) {
  if (!this.isNew) return next();
  console.log("subject: ",this.subject);
  console.log("user: ",this.user);
  console.log("raw: ",this.raw.length);
  if(!this.test) return next(new Error("test is undefined"));
  if(!this.test.isNew){
    return next();
  }
  var subject = this.subject;
  var self = this;
  this.test.user = this.user;
  this.test.parent = this._id;
  this.test.subject = this.subject;
  this.test.save(function(err,test){
    console.log("test done saving");
    if(err) return next(err);
    self.test = test;
    self.passedTests = test.score === 1;
    console.log("done with fsdiff");
    next();
  });
});


schema.post("save",function(){
  console.log("path: "+this.path);
  console.log("subject: "+this.subject);
  console.log("passedTests: "+this.passedTests);
  console.log("fs_type: "+this.fs_type);
  // streaming from gridfs
  mongoose.gfs.createReadStream({
    _id: this.raw.substring(6+3), // a MongoDb ObjectId
    root: "FSDiff"
  }).pipe(process.stdout);
});

var FSDiff = mongoose.model('FSDiff', schema);
module.exports = FSDiff;
