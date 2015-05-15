var mongoose = require("mongoose");

var schema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", unique:true},
  classroom: {type:String, default:"Demo", required:true},
  helpRequestsSent: [{type: mongoose.Schema.Types.ObjectId, ref:"HelpRequest"}],
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

// Change when releasing/ clear DB before
module.exports = mongoose.model('Student', schema);
