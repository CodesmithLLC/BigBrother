
var SIO = require("socket.io");
var dataio = SIO("/data-analysis");

//we listen for when a new commit is created and re-emmit that out to the cluster emtter
var Commit = require("./Models/commit.model.js");
Commit.schema.post("create",function(commit){
  global.clusterEE.emit('mongoose:commit:create', commit);
});

//we listen for when a new fs diff is created and re-emmit that out to the cluster emitter
var FS = require("./Models/fs.model.js");
FS.schema.post("create",function(fsdiff){
  global.clusterEE.emit('mongoose:fs:create', fsdiff);
});


//When we get an event from the cluster emitter, we want to
//  -Send the data to any socket io listeners
global.clusterEE.on('mongoose:*:create', function(channel, obj) {
  SIO.room(channel.split(":")[1]).emit("create",obj);
});


dataio.on("connect",function(ws){
  ws.on("room",function(roomname){
    ws.joinRoom(roomname);
  });
});

module.exports.attachMe = dataio;
