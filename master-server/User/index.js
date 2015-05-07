var U = require("./UserModel");
var bcrypt = require('bcrypt-nodejs');
var async = require("async");
var SALT_WORK_FACTOR = 10;

module.exports = function(config,next){
  async.parallel([upsertStudent,upsertTA,staticStudent,staticTA],function(err){
    return next(err,{
      middleware:require("./userMiddleware")(config.user),
      router:require("./router"),
    });
  });
};


function upsertStudent(next){
  var p = Math.random().toString(36).substring(2);
  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);

  var u = new U({
    roles: ["student"],
    email: "fake@email.com",
    password: bcrypt.hashSync(p, salt)
  });
  var upsertData = u.toObject();
  delete upsertData._id;
  U.update({username: "stu"}, upsertData, {upsert: true}, function(err,model){
    if(err) return next(err);
    console.log("student{name:\"stu\",pass:\""+p+"\"}");
    next();
  });
}

function upsertTA(next){
  var p = Math.random().toString(36).substring(2);
  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);

  var u = new U({
    roles: ["teachers_assistant"],
    email: "fake@email.com",
    password: bcrypt.hashSync(p, salt)
  });
  var upsertData = u.toObject();
  delete upsertData._id;
  U.update({username: "ta"}, upsertData, {upsert: true}, function(err,model){
    if(err) return next(err);
    console.log("ta{name:\"ta\",pass:\""+p+"\"}");
    next();
  });
}

function staticStudent(next){
  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  U.update({username: "stuStatic"}, {
    roles: ["student"],
    email: "fake@email.com",
    password: bcrypt.hashSync("pass", salt)
  }, {upsert: true}, function(err,model){
    if(err) return next(err);
    console.log("student{name:\"stuStatic\",pass:\"pass\"}");
    next();
  });

}

function staticTA(next){
  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  U.update({username: "taStatic"}, {
    roles: ["teachers_assistant"],
    email: "fake@email.com",
    password: bcrypt.hashSync("pass", salt)
  }, {upsert: true}, function(err,model){
    if(err) return next(err);
    console.log("student{name:\"taStatic\",pass:\"pass\"}");
    next();
  });

}
