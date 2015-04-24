var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  fs_type: {type:String,enum:["add","change","rem"]},
  subject:String,
  linesAdded:Number,
  linesRemoved:Number,
  totalChanges:Number,
  passedTests:Boolean,
  raw: Buffer
});


schema.statics.fromObject = function(obj){

};


var FSDiff = mongoose.model('FSDiff', schema);
module.exports = FSDiff;
