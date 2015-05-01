var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
  parent: mongoose.Schema.Types.ObjectId,
  subject:String,
  passes: Number,
  total:Number,
  score: Number,
  raw: Buffer
});


schema.statics.Permission = function(req,next){
  next(false);
};

var Test = mongoose.model('Test', schema);
module.exports = Test;
