var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  roles: [String],
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

// Password verification
userSchema.methods.createToken = function(cb) {
  var now = Date.now();
  //This obviously will change, and if it doesn't, its easy to fake
  cb(void(0), this._id + "_" + now);
};

userSchema.statics.userFromToken = function(token,cb){
  token = token.split("_");
  if(parseInt(token[1]) + 5000 < Date.now()){
    return next("timeout");
  }
  this.findOne({_id:token[0]},function(err,user){
    if(err) return next(err);
    if(!user) return next("Not Found");
    next(void(0),user);
  });
};


userSchema.pre('save', function(next) {
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
module.exports = mongoose.model('User', userSchema);
