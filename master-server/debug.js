var mongoose = require("mongoose");
var U = require("./User/UserModel");
var TA = require("./portals/models/ta");
var STU = require("./portals/models/student");
var async = require("async");

module.exports = function(next){
  async.parallel([upsertStudent,upsertTA,staticStudent,staticTA],next);
};


function upsertStudent(next){
  var p = Math.random().toString(36).substring(2);
  U.findOne({username: "stu"},function(err,u){
    if(err) return next(err);
    if(!u){
      u = new U({
        username: "stu",
        roles: ["student"],
        email: "fake@email.com",
      });
    }
    u.password = p;
    u.save(function(err){
      if(err) return next(err);
      STU.findOne({user:u},function(err,stu){
        if(err) return next(err);
        if(stu){
          console.log("student{name:\"stu\",pass:\""+p+"\"}");
          return next();
        }
        stu = new STU({user: u});
        stu.save(function(err){
          if(err) return next(err);
          console.log("student{name:\"stu\",pass:\""+p+"\"}");
          next();
        });
      });
    });
  });
}

function upsertTA(next){
  var p = Math.random().toString(36).substring(2);
  U.findOne({username: "ta"},function(err,u){
    if(err) return next(err);
    if(!u){
      u = new U({
        username: "ta",
        roles: ["teachers_assistant"],
        email: "fake@email.com",
      });
    }
    u.password = p;
    u.save(function(err){
      if(err) return next(err);
      TA.findOne({user:u},function(err,ta){
        if(err) return next(err);
        if(ta){
          console.log("ta{name:\"ta\",pass:\""+p+"\"}");
          return next();
        }
        ta = new TA({user: u});
        ta.save(function(err){
          if(err) return next(err);
          console.log("ta{name:\"ta\",pass:\""+p+"\"}");
          next();
        });
      });
    });
  });
}

function staticStudent(next){
  U.findOne({username: "stuStatic"},function(err,u){
    if(err) return next(err);
    if(!u){
      u = new U({
        username: "stuStatic",
        roles: ["student"],
        email: "fake@email.com",
        password: pass
      });
    }
    u.save(function(err){
      if(err) return next(err);
      STU.findOne({user:u},function(err,stu){
        if(err) return next(err);
        if(stu){
          console.log("student{name:\"stuStatic\",pass:\"pass\"}");
          return next();
        }
        stu = new STU({user: u});
        stu.save(function(err){
          if(err) return next(err);
          console.log("student{name:\"stuStatic\",pass:\"pass\"}");
          next();
        });
      });
    });
  });

}

function staticTA(next){
  U.findOne({username: "stuStatic"},function(err,u){
    if(err) return next(err);
    if(!u){
      u = new U({
        username: "taStatic",
        roles: ["teachers_assistant"],
        email: "fake@email.com",
        password: pass
      });
    }
    u.save(function(err){
      if(err) return next(err);
      TA.findOne({user:u},function(err,ta){
        if(err) return next(err);
        if(ta){
          console.log("ta{name:\"taStatic\",pass:\"pass\"}");
          return next();
        }
        ta = new TA({user: u});
        ta.save(function(err){
          if(err) return next(err);
          console.log("ta{name:\"taStatic\",pass:\"pass\"}");
          next();
        });
      });
    });
  });
}
