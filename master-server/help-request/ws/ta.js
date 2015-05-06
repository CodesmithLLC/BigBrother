var mongoose = require("mongoose");
var TA = require("../../portals/models/ta");
var HelpRequest = require("../models/HelpRequest");


module.exports = function(io){
  var hr_id2to = {};

  HelpRequest.schema.post("save",function(help){
    if(help.state === "waiting"){
      return escalate(help.escalation,help);
    }
  });

  function escalate(level,help){
    hr_id2to[help._id] = setTimeout(function(){
      if(level === "admin"){
        return noHelp(help);
      }
      TA.markIgnore(level,help,function(e){
        return escalate(level === "global"?"admin":"global",help);
      });
    },5*60*1000);
    level = level==="local"?help.classroom:level;
    HelpRequest.update({_id:help._id},{escalation:level},function(e){
      if(e) console.error(e);
      io.to(level+"/help-request").emit("request",help);
    });
  }

  function noHelp(help){
    HelpRequest.update({_id:help._id},{state:"timeout"},function(e){
      if(e) console.error(e);
      console.log("no help");
    });
  }

  return function(ws){
    var user = ws.request.user;
    TA.find({user:user},function(err,ta){
      if(err){
        console.error(err);
        return ws.disconnect();
      }
      if(!ta){
        console.error("didn't find ta");
        return ws.disconnect();
      }
      var cl, gl, fl;
      ws.join(ta.classroom+"-requests");
      ws.join("global-requests");
      ws.on("help-take",function(help_id){
        if(!(help_id in hr_id2to)){
          return ws.emit("help-taken",help_id);
        }
        clearTimeout(hr_id2to[help_id]);
        delete hr_id2to[help_id];
        HelpRequest.findByIdAndUpdate(help_id,{$push:{ta:ta._id}, state:"taken"},function(e,help){
          if(e) console.error(e);
          ws.broadcast
            .to(help.escalation==="local"?help.classroom:help.escalation)
            .emit("help-taken",help._id);
          ws.broadcast.to(help.student).emit("help-taken",help._id);
          ws.emit("go-help",help._id);
        });
      });
    });
  };
};
