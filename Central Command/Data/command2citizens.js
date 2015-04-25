var SIO = require("socket.io");
var dataio = SIO("/data-feeder");
var clusterEE = require("../clusterEE");
var User = require("../User/UserModel");
var Commit = require("./models/Commit");
var FSDiff = require("./models/FSDiff");


dataio.on("connect",function(ws){
  ws.on("authorize",function(token){
    User.userFromToken(token,function(err,user){
      if(err) return ws.emit("authorize-error",err);
      ws.user = user;
    });
  });
  ws.on("commit",function(commit){
    if(!ws.user) return ws.disconnect();
    Commit.fromObject(commit);
  });
  ws.on("fsdiff",function(diff){
    if(!ws.user) return ws.disconnect();
    FSDiff.fromObject(diff);
  });
});

module.exports.attachMe = dataio;
