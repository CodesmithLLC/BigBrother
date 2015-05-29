var mongoose = require("mongoose");
var TA = require("../../portals/models/ta");
var HelpRequest = require("../models/HelpRequest");
var async = require("async");


module.exports = function(io){
  var hr_id2to = {};

  HelpRequest.schema.post("save",function(help){
    switch(help.state){
      case "waiting": return miniEscalate(help.escalation,help);
      case "taken":
        io.to(help.escalation==="local"?help.classroom:help.escalation+"-requests")
          .emit("help-taken",help._id);
        return io.to(help.ta._id?help.ta._id:help.ta).emit("go-help",help);
      default:
        return io.to(help.ta._id?help.ta._id:help.ta).emit("end-help",help);
    }
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
      help.ignore(level,function(e){
        if(e) console.error(e);
        HelpRequest.update({_id:help._id},{escalation:level},function(e){
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
      function(next){
        TA.findOne({user:ws.request.user},function(e,ta){
          if(e) return next(e);
          if(!ta) return next("no TA matching "+ws.request.user._id);
          ws.ta = ta;
          next();
        });
      },
      function(next){
        HelpRequest.findTAsCurrent(ws.ta,function(e,cur){
          if(e) return next(e);
          if(cur) ws.emit("go-help",cur);
          else ws.emit("end-help");
          next();
        });
      },
      function(next){
        ws.join("global-requests");
        ws.join(ws.ta._id);
//        ws.join(ta.classroom+"-requests");
        next();
      },
    ],function(e,ta){
      if(e){
        console.error("Cannot Join Rooms",e);
        return ws.disconnect();
      }
      ws.on("help-take",function(help_id){
        HelpRequest.take(help_id,ws.ta,function(e,help){
          if(e){
            return console.error("error taking hr: ",e);
          }
        });
      });
    });
  };
};
