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

// Change when releasing/ clear DB before
TA = module.exports = mongoose.model('TeachersAssistant', schema);
