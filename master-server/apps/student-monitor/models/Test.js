var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student"},
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


var Test = mongoose.model('Test', schema);
module.exports = Test;
