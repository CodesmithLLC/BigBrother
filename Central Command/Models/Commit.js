var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  subject:String,
  totalChanges:Number,
  passedTests:Boolean,
  raw: Buffer
});

schema.statics.fromObject = function(obj){

};

var Commit = mongoose.model('Commit', schema);
module.exports = Commit;
