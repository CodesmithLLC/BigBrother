var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  rel: mongoose.Schema.Types.ObjectId,
  subject:String,
  net_score: Number,
  successes:[String],
  fails:[{
    key:String,
    reason:String
  }],
  total:Number,
  raw: Buffer
});

schema.statics.fromRaw = function(raw){

};


var Test = mongoose.model('Test', schema);
module.exports = Test;
