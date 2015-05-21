//Done just to have them loaded
//Most of the logic is done in /Abstract/mongooseEE
require("./models/Commit");
require("./models/FSDiff");

var mongoose = require("mongoose");
var TA = require("../portals/models/ta");

module.exports = function(io){
  mongoose.ee.on('FSDiff:create',function(diff){
    mongoose.model("Student").findOne({_id:diff.student}, function(err,stu){
      if(err) return console.error(err);
      if(!stu) return console.error("non existing student");
      diff.student = stu;
      console.log(stu.classroom);
      io.to(stu.classroom).emit('fsdiff', diff);
    });
  });
  mongoose.ee.on('Commit:create',function(diff){
    mongoose.model("Student").findOne({_id:diff.student}, function(err,stu){
      if(err) return console.error(err);
      if(!stu) return console.error("non existing student");
      diff.student = stu;
      console.log(stu.classroom);
      io.to(stu.classroom).emit('commit', diff);
    });
  });
  return function(ws){
    if(ws.request.user.roles.indexOf("teachers_assistant") === -1){
      console.log("not a ta");
      return ws.disconnect();
    }
    TA.findOne({user:ws.request.user},function(err,ta){
      if(err){
        console.error(err);
        return ws.disconnect();
      }
      if(!ta){
        console.error("Non existant ta");
        return ws.disconnect();
      }
      console.log("ta classroom: ",ta.classroom);
      ws.join(ta.classroom);
    });
  };
};
