var cluster = require('cluster');
var async = require("async");
var WebSocket = require('ws');
var os = require("os");
cluster.setupMaster({
  exec: '../server.js'
});
var numCPUs = os.cpus().length;


var ws;
async.series([
  function(next){
    //Parent Connection
    ws = new WebSocket('ws://'+masterServerLocation+':8080');
    ws.once('open', function open() {
      next();
    }).once('error', next);
  },function(next){
    //Children Creation
    cluster.on('fork', function(worker) {
      worker.on("message",function(message){
        if(!message.event) return console.log(message);
        Object.keys(cluster.workers).forEach(function(key){
          if(cluster.workers[key] === worker) return;
          cluster.workers[key].send(message);
        });
        ws.send(message);
      });
    });
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
    });
    next();
  }
],function(e){
  if(e) throw e;
});
