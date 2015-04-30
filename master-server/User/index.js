var U = require("./UserModel");
var async = require("async");

module.exports = function(config,next){
  async.parallel([upsertStudent,upsertTA],function(err){
    return next(err,{
      middleware:require("./userMiddleware")(config),
      router:require("./router"),
    });
  });
};


function upsertStudent(next){
  var p = Math.random().toString(36).substring(2);
  var u = new U({
    permissions: ["student"],
    email: "fake@email.com",
    password: p
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
  var u = new U({
    permissions: ["teachers_assistant"],
    email: "fake@email.com",
    password: p
  });
  var upsertData = u.toObject();
  delete upsertData._id;
  U.update({username: "ta"}, upsertData, {upsert: true}, function(err,model){
    if(err) return next(err);
    console.log("student{name:\"ta\",pass:\""+p+"\"}");
    next();
  });
}
