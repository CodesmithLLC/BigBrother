var Stu = require("../../portals/models/student");
var HelpRequest = require("../models/HelpRequest");
var async = require("async");
/*
  for students
  We detect when a help request has been made
  We detect when the help request has been taken

  We wait for when they say the current helper is finished
    -If the TA was successful, mark it
    -Otherwise, reemit

*/

module.exports = function(io){
  HelpRequest.schema.post("save",function(hr){
    console.log(hr);
    var id = hr.student._id?hr.student._id:hr.student;
    switch(hr.state){
      case "taken": return io.to(id).emit("help-here");
      case "waiting": return io.to(id).emit("help-aware");
      default: return io.to(id).emit("help-finish");
    }
  });
  return function(ws){
    var user = ws.request.user;
    async.series([
      function(next){
        Stu.findOne({user:user},function(err,stu){
          if(err) return next(err);
          if(!stu) return next(new Error("didn't find student"));
          ws.stu = stu;
          ws.join(stu._id);
          next();
        });
      },function(next){
        HelpRequest.findOne({student:ws.stu._id, state:{$in:["taken","waiting"]}})
        .populate("ta").exec(function(err,hr){
          if(err) return next(err);
          console.log((!hr)?"fin":hr.state === "taken"?"tak":"awa");
          if(!hr) ws.emit("help-finish");
          else if(hr.state === "taken") ws.emit("help-here",hr.ta);
          else ws.emit("help-aware");
          next();
        });
      }
    ],function(e){
      if(e){
        console.error(e);
        return ws.disconnect();
      }
      ws.on("help-fail",function(){
        HelpRequest.fail(ws.stu,function(e){
          if(e) return console.error("error in help fail: ",e);
        });
      });
      ws.on("help-solve",function(){
        HelpRequest.solve(ws.stu,function(e){
          if(e) return console.error("error in help solve: ",e);
        });
      });
      ws.on("help-cancel",function(help_id){
        HelpRequest.cancel(ws.stu,function(e){
          if(e) return console.error("error in help cancel: ",e);
        });
      });
    });
  };
};
