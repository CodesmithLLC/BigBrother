var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Test = require("./Test");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  subject:String,
  commitMessage:String,
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

schema.pre('save', function(next) {
  if (!this.isNew) return next();
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


var Commit = mongoose.model('Commit', schema);
module.exports = Commit;
