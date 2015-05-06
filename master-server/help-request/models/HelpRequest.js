var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student"},
  ta: [{type: mongoose.Schema.Types.ObjectId, ref:"TA"}],
  classroom:{type:String,required:true,index:true},
  description:String,
  snapshot: {type: mongoose.Schema.Types.ObjectId, ref:"SnapShot"},
  state:{
    type:String,
    enum:["waiting","taken","solved","canceled","timeout"],
    default:"waiting"
  },
  escalation:{type:String, default:"local"}
});

schema.statics.fromObject = function(help_request,obj,next){
  this.create({
    student:help_request.user,
    help_request:help_request,
    subject:help_request.subject,
    raw:obj
  },next);
};

schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  if(req.method === "GET"){
    return next(req.user.permissions.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    return next(req.user.permissions.indexOf("student") !== -1);
  }
  return next(false);
};

schema.statics.defaultCreate = function(req){
  return {student:req.user};
};


var HelpRequest = mongoose.model('HelpRequest', schema);
module.exports = HelpRequest;
