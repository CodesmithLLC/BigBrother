var EE = require("events").EventEmitter;
var ioRouter = require("../Abstract/ioRouter.js");
var SIO = require("socket.io");
var CentralCommand = SIO("/bigbrother");

var FSDiff = require("../Models/FSDiff");
var Commit = require("../Models/Commit");

CentralCommand.on("connect",function(ws){
  ioRouter(ws);
  ws.on("login",function(req,res){

  });

  ws.on("logout",function(req,res){

  });

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
