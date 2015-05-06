var highlight = require("highlight");
var Snapshot = require("./SnapShot");
var io = require("socket.io");

function HelpListener(){
  this.io = io("/help-request");
  

}

module.exports = HelpListener;
