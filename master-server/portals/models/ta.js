var mongoose = require("mongoose");

var schema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", unique:true},
  classroom: {type:String, default:"Demo", required:true},
  ignores: [{type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}],
  successes: [{type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}],
  failures: [{type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}],
  current: {type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}
});

schema.pre('save', function(next) {
  console.log('inside save method');
  var user = this;
  if(!user.isModified('password')) {
    return next();
  }

  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  user.password = bcrypt.hashSync(user.password, salt);
  user.apiKey = bcrypt.hashSync(user.username, salt).slice(10).replace(/\./g, '');
  next();
});

schema.statics.markIgnore = function(level,help,next){

};

// Change when releasing/ clear DB before
module.exports = mongoose.model('TeachersAssistant', schema);
