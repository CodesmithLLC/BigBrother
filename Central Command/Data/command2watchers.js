var SIO = require("socket.io");
var dataio = SIO("/data-analysis");
var clusterEE = require("../clusterEE");

//When we get an event from the cluster emitter, we want to
//  -Send the data to any socket io listeners
clusterEE.on('mongoose:*:create', function(channel, obj) {
  SIO.room(channel.split(":")[1]).emit("create",obj);
});


dataio.on("connect",function(ws){
  if(!ws.user) return ws.disconnect();
  if(ws.user.role !== "watcher") return ws.disconnect();
  ws.on("room",function(roomname){
    ws.joinRoom(roomname);
  });
});

module.exports.attachMe = dataio;
