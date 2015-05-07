
var template = require("./template.html");
var fileTemplate = require("./snapshot-file.html");
var folderTemplate = require("./snapshot-folder.html");
var templateTransfrom = require("../../../../Abstract/template.js");
var mime = require("mime-types");
var UTF8 = require("utf-8");
var work = require("webworkify");

function HelpRequest(help){
  this.elem = templateTransfrom(template,help)[0];
  this.worker = work(require("./worker.js"));
  this.worker.postMessage({
    event:"initialize",
    data:help
  });
}

HelpRequest.prototype.getPath = function(path){
  var l,id=Math.random()+"_"+Date.now();
  var self = this;
  return new Promise(function(rej,res){
    self.worker.addEventListener("message", l = function(e){
      if(e.data.event !== id) return;
      self.worker.removeEventListener("message",l);
      if(e.data.error) return rej(e.data.error);
      res(self.render(path,e.data.data));
    });
    self.worker.postMessage({
      id:id,
      event:"path",
      data:path
    });
  });
};

HelpRequest.prototype.render = function(path,raw){
  return templateTransform(fileTemplate,{
    mime:mime.lookup(path),
    content:UTF8.getStringFromBytes(raw)
  });
};

HelpRequest.prototype.close = function(){
  this.worker.terminate();
};

module.exports = HelpRequest;
