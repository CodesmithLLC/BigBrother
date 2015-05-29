var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student",required:true},
  ta: {type: mongoose.Schema.Types.ObjectId, ref:"TA",required:true},
  interactionType:{type:String,required:true,enum:["ignore","success","failure"]},
  subject:{type:String,required:true},
  helpRequest: {type:mongoose.Schema.Types.ObjectId, required:true, ref:"HelpRequest"},
  createdAt: {
    type:Number,
    default:Date.now,
    index:true
  }
});

schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  next(req.user.roles.indexOf("admin") !== -1);
};

var HelpInteraction = mongoose.model('HelpInteraction', schema);
module.exports = HelpInteraction;
