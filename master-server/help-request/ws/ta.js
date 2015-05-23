var mongoose = require("mongoose");
var TA = require("../../portals/models/ta");
var HelpRequest = require("../models/HelpRequest");
var async = require("async");


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
        if(e) console.error(e);
        return escalate(level === "global"?"admin":"global",help);
      });
    },5*60*1000);
    HelpRequest.update({_id:help._id},{escalation:level},function(e){
      if(e) console.error(e);
      io.to((level==="local"?help.classroom:level)+"-requests").emit("request",help);
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
    var cl, gl, fl;
    async.waterfall([
      TA.find.bind(TA,{user:user}),
      function(ta,next){
        if(arguments.length === 1) return next("didn't find ta");
        ws.join(ta.classroom+"-requests");
        ws.join("global-requests");
        next(void 0, ws);
      },
    ],function(e){
      if(e) return ws.disconnect();
      ws.on("help-take",function(help_id){
        if(!(help_id in hr_id2to)){
          return ws.emit("help-taken",help_id);
        }
        clearTimeout(hr_id2to[help_id]);
        delete hr_id2to[help_id];
        HelpRequest.findByIdAndUpdate(help_id,{$push:{ta:ta._id}, state:"taken"},function(e,help){
          if(e) console.error(e);
          ws.broadcast
            .to(help.escalation==="local"?help.classroom:help.escalation+"-requests")
            .emit("help-taken",help._id);
          ws.broadcast.to(help.student).emit("help-taken",help._id);
          ws.emit("go-help",help._id);
        });
      });
    });
  };
};
