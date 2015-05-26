var mongoose = require("mongoose");
var TA = require("../../portals/models/ta");
var HelpRequest = require("../models/HelpRequest");
var async = require("async");


module.exports = function(io){
  var hr_id2to = {};

  HelpRequest.schema.post("save",function(help){
    if(help.state === "waiting") return miniEscalate(help.escalation,help);
  });

  function miniEscalate(level,help){
    io.to("global-requests").emit("request",help);
    hr_id2to[help._id] = setTimeout(noHelp.bind(noHelp,help), 5*60*1000);
  }

  function escalate(level,help){
    hr_id2to[help._id] = setTimeout(function(){
      if(level === "admin"){
        return noHelp(help);
      }
      HelpRequest.update({_id:help._id},{escalation:level},function(e){
        if(e) console.error(e);
        TA.markIgnore(level,help,function(e){
          if(e) console.error(e);
          return escalate(level === "global"?"admin":"global",help);
        });
      });
    },5*60*1000);
    console.log("escalating", level,", event: ", (level==="local"?help.classroom:level)+"-requests", help);
    io.to((level==="local"?help.classroom:level)+"-requests").emit("request",help);
  }

  function noHelp(help){
    console.log("no help1");
    HelpRequest.update({_id:help._id},{state:"timeout"},function(e){
      if(e) console.error(e);
      console.log("no help2");
    });
  }

  return function(ws){
    async.waterfall([
      TA.find.bind(TA,{user:ws.request.user}),
      function(ta,next){
        if(arguments.length === 1) return next("didn't find ta");
        ws.join("global-requests");
//        ws.join(ta.classroom+"-requests");
        next();
      },
    ],function(e){
      if(e){
        console.error("Cannot Join Rooms",e);
        return ws.disconnect();
      }
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
