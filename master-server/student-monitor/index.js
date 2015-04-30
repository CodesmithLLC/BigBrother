var SIO = require("socket.io");
var MASTER_SERVER = SIO("/bigbrother");

var FSDiff = require("../Models/FSDiff");
var Commit = require("../Models/Commit");
var mongoose = require("mongoose");
var TA = require("../portals/models/ta");

module.exports = function(ws){
  if(ws.request.user.roles.indexOf("teachers_assistant") === -1){
    return;
  }
  TA.find({user:ws.request.user},function(err,ta){
    if(err){
      console.error(err);
      return ws.disconnect();
    }
    mongoose.ee.on('commit:create',function(commit){
      if(commit.student.classroom !== ta.classroom) return;
      ws.emit("commit",commit);
    });
    mongoose.ee.on('fsdiff:create',function(fsdiff){
      if(fsdiff.student.classroom !== ta.classroom) return;
      ws.emit("fsdiff",fsdiff);
    });
  });
};

//we listen for when a new commit is created and re-emmit that out to the cluster emtter
var Commit = require("./models/commit.model.js");
Commit.schema.post("create",function(commit){
  mongoose.ee.emit('commit:create', commit);
});

//we listen for when a new fs diff is created and re-emmit that out to the cluster emitter
var FS = require("./models/fs.model.js");
FS.schema.post("create",function(fsdiff){
  mongoose.ee.emit('fsdiff:create', fsdiff);
});
