var mongoose = require("mongoose");
var TA;
var schema = mongoose.Schema({
  name: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", unique:true},
  online: {type:Boolean,default:false},
  classroom: {type:String, default:"Demo", required:true, index:true},
  semester: {type:Number, default:0,index:true},
  ignores: {type:Number,default:0},
  successes: {type:Number,default:0},
  failures: {type:Number,default:0},
  current: {type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}
});


schema.pre("validate",function(next){
  if(!this.isNew) return next();
  this.name = this.user.username;
  next();
});

schema.statics.markIgnore = function(level,help,next){
  var q = TA.find({semester:help.semester})
    .where({_id:{$nin:help.ignoredBy.concat(help.ta)}})
    .where({online:true,current:null});
  switch(level){
    case "local":
      q = q.where({classroom:help.classroom}); break;
    case "global": break;
    case "admin": return;
  }
  q.update({$inc:{ignores:1}}).select("_id").exec(function(e,docs){
    if(e) return next(e);
    help.constructor.where({_id:help._id})
    .update({$addToSet:{ignoredBy:{$each:docs}}}).exec(next);
  });
};

// Change when releasing/ clear DB before
TA = module.exports = mongoose.model('TeachersAssistant', schema);
