var clusterEE = require("../clusterEE");

//we listen for when a new commit is created and re-emmit that out to the cluster emtter
var Commit = require("./Models/commit.model.js");
Commit.schema.post("create",function(commit){
  clusterEE.emit('mongoose:commit:create', commit);
});

//we listen for when a new fs diff is created and re-emmit that out to the cluster emitter
var FS = require("./Models/fs.model.js");
FS.schema.post("create",function(fsdiff){
  clusterEE.emit('mongoose:fs:create', fsdiff);
});


module.exports = require("./command2citizen");
module.exports = require("./command2watcher");
