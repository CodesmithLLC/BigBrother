var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student"},
  ta: [{type: mongoose.Schema.Types.ObjectId, ref:"TA"}],
  classroom:{type:String,required:true,index:true},
  description:String,
  raw: String,
  state:{
    type:String,
    enum:["waiting","taken","solved","canceled","timeout"],
    default:"waiting",
    index:true
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
    return next(req.user.roles.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    console.log("here",req.user.roles.indexOf("student") !== -1);

    return next(req.user.roles.indexOf("student") !== -1);
  }
  return next(false);
};

schema.statics.defaultCreate = function(req,next){
  mongoose.model("Student").findOne({user:req.user},function(err,stud){
    if(err) return next(err);
    if(!stud) return next(new Error("this student does not exist"));
    return next(void 0, {student:stud,classroom:stud.classroom});
  });
};

schema.statics.defaultSearch = function(req,next){
  mongoose.model("TeachersAssistant").find({user:req.user},function(err,ta){
    if(err) return next(err);
    next(void(0),{$or:[
      {classroom:ta.classroom,escalation:"local"},
      {escalation:"global"}
      ],
      state:"waiting"
    });
  });
  return {student:req.user};
};


var HelpRequest = mongoose.model('HelpRequest', schema);
module.exports = HelpRequest;
