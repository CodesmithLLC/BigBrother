var EE = require("events").EventEmitter;
var ioRouter = require("../Abstract/ioRouter.js");
var SIO = require("socket.io");
var MASTER_SERVER = SIO("/bigbrother");

var FSDiff = require("../Models/FSDiff");
var Commit = require("../Models/Commit");

MASTER_SERVER.on("connect",function(ws){
  ioRouter(ws);

  ws.on("commit-add",function(commit){
    Commit.createFromObject(ws.user,commit);
  });
  ws.on("fs-add",function(add){
    FSDiff.createFromObject(ws.user,"add",fsadd);
  });
  ws.on("fs-diff",function(diff){
    FSDiff.createFromObject(ws.user,"diff",diff);
  });
  ws.on("fs-rem",function(rem){
    FSDiff.createFromObject(ws.user,"rem",rem);
  });
});

//we listen for when a new commit is created and re-emmit that out to the cluster emtter
var Commit = require("./models/commit.model.js");
Commit.schema.post("create",function(commit){
  global.clusterEE.emit('mongoose:commit:create', commit);
});

//we listen for when a new fs diff is created and re-emmit that out to the cluster emitter
var FS = require("./models/fs.model.js");
FS.schema.post("create",function(fsdiff){
  global.clusterEE.emit('mongoose:fs:create', fsdiff);
});

module.exports = MASTER_SERVER;
