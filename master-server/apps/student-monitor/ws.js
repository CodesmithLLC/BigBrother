//Done just to have them loaded
var Commit = require("./models/Commit");
var FSDiff = require("./models/FSDiff");

var TA = require("../portals/models/ta");
var Student = require("../portals/models/student");

module.exports = function(io){
  Commit.schema.post("save",function(){
    if(this.wasNew){
      Student.findOne({_id:this.student}, function(err,stu){
        if(err) return console.error(err);
        if(!stu) return console.error("non existing student");
        console.log("A Save: ", stu.classroom);
        io.to(stu.classroom).emit('fsdiff', diff);
      });
    }
  });
  FSDiff.schema.post("save",function(){
    console.log("Save: ", this.wasNew);
    if(this.wasNew){
      Student.findOne({_id:diff.student}, function(err,stu){
        if(err) return console.error(err);
        if(!stu) return console.error("non existing student");
        console.log("A Save: ", stu.classroom);
        io.to(stu.classroom).emit('commit', diff);
      });
    }
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
