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
userSchema.methods.createToken = function(ipaddress,next) {
  //This obviously will change, and if it doesn't, its easy to fake
  ipaddress = new Buffer(ipaddress).toString('base64');
  next(void(0), ipaddress+"_"+this._id + "_" + Date.now());
};

userSchema.methods.compareToken = function(ipaddress,token,next){
  if(token.length < 3) return next(void 0, false);
  token = token.split("_");
  ipaddress = new Buffer(ipaddress).toString('base64');
  if(ipaddress !== token[0]){
    console.log(ipaddress,"!==",token[0]);
    return next(void 0,false);
  }
  if(this._id.toString() !== token[1]){
    console.log(this._id, "!==", token[1]);
    return next(void 0,false);
  }
  if(Date.now() - 60*60*1000 > token[2]){
    console.log(Date.now() - 60*60*1000, ">", token[2]);
    return next(void 0,false);
  }
  return next(void 0, true);
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
