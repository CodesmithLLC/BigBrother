var fs = require("fs");
var template = fs.readFileSync(__dirname+"/template.html","utf8");
var jQuery = require("jquery");
var Mustache = require("mustache");
Mustache.parse(template);

function HelpRequest(help){
  this._id = help._id;
  this.snapshot = help.snapshot;
  this.elem = jQuery(Mustache.render(template,help));
}


module.exports = HelpRequest;
