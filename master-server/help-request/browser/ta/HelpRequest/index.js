
var template = require("./template.html");
var templateTransfrom = require("../../../../Abstract/template.js");

function HelpRequest(help){
  this.elem = templateTransfrom(template,help)[0];
  this.worker = new Worker("./HelpRequest/worker.js");
  this.worker.postMessage({
    event:"initialize",
    data:help
  });
}

HelpRequest.prototype.getPath = function(path){

};

module.exports = HelpRequest;
