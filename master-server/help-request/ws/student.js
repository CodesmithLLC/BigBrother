var Stu = require("../../portals/models/student");
var HelpRequest = require("../models/HelpRequest");

/*
  for students
  We detect when a help request has been made
  We detect when the help request has been taken

  We wait for when they say the current helper is finished
    -If the TA was successful, mark it
    -Otherwise, reemit

*/

module.exports = function(ws){
  var user = ws.request.user;
  Stu.find({user:user},function(err,stu){
    if(err){
      console.error(err);
      return ws.disconnect();
    }
    if(!stu){
      console.error("didn't find student");
      return ws.disconnect();
    }
    ws.join(stu._id);
    ws.on("help-reapply",function(help_id){
      HelpRequest.findById(help_id,function(e,help){
        if(e){
          return console.error(e);
        }
        TA.markFailure(help,function(e){
          if(e){
            return console.error(e);
          }
          help.state = "waiting";
          help.save(function(e){
            if(e){
              return console.error(e);
            }
            stu2ws[help.student].emit("help-acknowledged",help_id);
          });
        });
      });
    });
    ws.on("help-complete",function(help_id){
      HelpRequest.findById(help_id,function(e,help){
        if(e){
          return console.error(e);
        }
        if(help.state !== "taken"){
          return console.error("should not complete when not taken");
        }
        TA.markSuccess(help,function(e){
          if(e){
            return console.error(e);
          }

          help.state = "solved";
          help.save(function(e){
            if(e){
              return console.error(e);
            }
          });
        });
      });
    });
    ws.on("help-cancel",function(help_id){
      HelpRequest.findById(help_id,function(e,help){
        if(e){
          return console.error(e);
        }
        help.state = "canceled";
        help.save(function(e){
          if(e){
            return console.error(e);
          }
        });
      });
    });
  });
};
