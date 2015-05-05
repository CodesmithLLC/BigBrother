var mongoose = require("mongoose");
var TA = require("../portals/models/ta");

var classRooms = {};

/*
  we listen for a help request create
    -we send it locally
    -if a ta takes a help request
      -request is added to the tas attempts
      -ta is marked as busy
      -notify the student
      -If the request was unsuccessful
        -It gets re-emitted
        -request is added to the tas failures
        -ta is marked as available
      -If the request was successful
        -ta is marked as available
        -request is added to the tas successes
    -after 5 minutes, if nobody took it
      -foreach ta
        -if the ta is not busy-request is added to the ignored
      -We send the request to everyone but local
        -we wait for 5 minutes to see if anybody takes the global help request
        -foreach ta
          -if the ta is not busy, they get marked


*/

module.exports = function(ws){
  var user = ws.request.user;
  TA.find({user:user},function(err,ta){
    if(err){
      console.error(err);
      return ws.disconnect();
    }
    var cl, fl;
    mongoose.ee.on(ta.classroom+'/help-request',cl = function(help){
      if(commit.student.classroom !== ta.classroom) return;
      ws.emit(ta.classroom+'/help-request:create',help);
      var t, l;
    });
    mongoose.ee.on('global/help-request',cl = function(help){
      if(commit.student.classroom === ta.classroom) return;
      ws.emit(ta.classroom+'/help-request:create',help);
      var t, l;
    });
    ws.on("take-help",function(help_id){
      if(help_id !== help_id) return;

    });
    mongoose.ee.on('help-request:create',fl = function(fsdiff){
      if(fsdiff.student.classroom !== ta.classroom) return;
      ws.emit("fsdiff",fsdiff);
    });
    ws.on("disconnect",function(){
      classRooms[ta.classroom] = {};
      mongoose.ee.removeListener("fsdiff:create",fl);
      mongoose.ee.removeListener("commit:create",cl);
    });
  });
};

var HelpRequest = require("./models/HelpRequest");
