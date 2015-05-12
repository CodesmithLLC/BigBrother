var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  parent: mongoose.Schema.Types.ObjectId,
  subject:String,
  score: Number,
  stats: {
    suites: Number,
    tests: Number,
    passes: Number,
    pending: Number,
    failures: Number,
    start: Date,
    end: Date,
    duration: Number,
  },
  tests: [{title:String,fullTitle:String,duration:Number,err:Object}],
  pending: [{title:String,fullTitle:String,duration:Number,err:Object}],
  failures: [{title:String,fullTitle:String,duration:Number,err:Object}],
  passes: [{title:String,fullTitle:String,duration:Number,err:Object}]
});


schema.statics.Permission = function(req,next){
  next(false);
};

schema.pre("save",function(next){
  this.score = this.stats.passes/this.stats.tests;
  next();
});

schema.post("save",function(){
  console.log("subject: "+this.subject);
  console.log("score: "+this.score);
  console.log("stats: ",this.stats);
  console.log("tests: ",this.tests[0], this.tests.length);
  console.log("pending: ",this.pending[0], this.pending.length);
  console.log("failures: ",this.failures[0], this.failures.length);
  console.log("passes: ",this.passes[0], this.passes.length);
});


var Test = mongoose.model('Test', schema);
module.exports = Test;
