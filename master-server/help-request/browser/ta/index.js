//var highlight = require("highlight");
var HelpRequest = require("./HelpRequest");
var io = require("socket.io-client");
var sa = require("superagent");

var fs = require("fs");
var template = fs.readFileSync(__dirname+"/List/template.html","utf8");
var templateTransfrom = require("../../../Abstract/browserify-utils.js").renderTemplate;

function HelpList(){
  var self = this;
  this.requests = {};
  this.elem = templateTransfrom(template,this)[0];
  this.list = this.elem.querySelector(".help-list");
  this.traverse = this.elem.querySelector(".directory-traversal");
  this.content = this.elem.querySelector(".file-content");
  this.currentRequest = void(0);
  this.io = io(window.location.origin+"/help-request");
  this.io.on("help-request",self.addHelp.bind(self));
  this.io.on("help-taken",function(help_id){
    self.requests[help_id].elem.parent.removeChild(self.requests[help_id].elem);
    self.requests[help_id].close();
    delete self.requests[help_id];
  });
  sa.get("/HelpRequest",{ipp:100}).end(function(err,res){
    if(err) throw err;
    res.body.forEach(self.addHelp.bind(self));
  });
}

HelpList.prototype.addHelp = function(help){
  if(help._id in this.requests){
    return this.requests[help._id].update(help);
  }
  this.requests[help._id] = new HelpRequest(help);
  this.list.append(self.requests[help._id].elem);
  this.requests[help._id].elem.addEventListener("click",self.helpClick.bind(self));
};

HelpList.prototype.helpClick = function(e){
  e.preventDefault();
  var _id = e.target.getAttribite("data-id");
  if(!(_id in this.requests)) throw new Error("non existant help request");
  this.fileContent.empty();
  this.currentRequest = this.requests[_id];
  this.changePath("root/");
  /*
    empty current viewer
    go to path "/" of that help request
  */
};

HelpList.prototype.changePath = function(path){
  var self = this;
  this.updatePath(path);
  this.currentRequest.getPath(path)
  .then(function(content){
    self.content.innerHTML = content;
    var els = self.content.querySelectorAll(".path");
    if(!els) return;
    for(var i=0,l=els.length;i<l;i++){
      els[i].addEventListener("click",self.changePath.bind(self));
    }
  });
};

HelpList.prototype.updatePath = function(path){
  var self = this;
  var elem = document.createElement("span");
  elem.setAttribute("class","path");
  var netpath = "#";
  path.split("/").forEach(function(path){
    var a = document.createElement("a");
    a.innerHTML = path;
    netpath += (path||"root")+"/";
    a.setAttribute("href",netpath);
    a.addEventListener("click",self.changePath.bind(self));
    elem.append(a);
  });
  var old = this.travers.querySelector(".path");
  old.parent.replace(old,elem);
};

module.exports = HelpList;
