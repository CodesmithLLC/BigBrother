var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Test = require("./Test");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  subject:String,
  totalChanges:Number,
  passedTests:Boolean,
  raw: Buffer
});

schema.statics.fromObject = function(user,obj){
  var commit = new Commit();
  var subject = obj.subject;
  Test.fromObject(commit,user,subject,obj.test,function(err,test){
    if(err) return console.error(err);
    commit.user = user;
    commit.test = test;
    commit.subject = subject;
    commit.passedTests = test.score === 1;
    commit.raw = obj.diff;
  });
};

var Commit = mongoose.model('Commit', schema);
module.exports = Commit;
