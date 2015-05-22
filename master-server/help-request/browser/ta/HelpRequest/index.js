var fs = require("fs");
var template = fs.readFileSync(__dirname+"/List/template.html","utf8");
var Mustache = require("mustache");
Mustache.parse(template);

function HelpRequest(help){
  this._id = help._id;
  this.snapshot = help.snapshot;
  this.elem = jQuery(Mustache.render(template,student));
}


module.exports = HelpRequest;
