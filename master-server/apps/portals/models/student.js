var mongoose = require("mongoose");

var schema = mongoose.Schema({
  name: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", unique:true},
  classroom: {type:String, default:"Demo", required:true},
  helpRequestsSent: [{type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}],
});


schema.pre("validate",function(next){
  if(!this.isNew) return next();
  this.name = this.user.username;
  next();
});

// Change when releasing/ clear DB before
module.exports = mongoose.model('Student', schema);
