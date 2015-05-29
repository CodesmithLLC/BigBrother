var fs = require("fs");
var template = fs.readFileSync(__dirname+"/template.html","utf8");
var jQuery = require("jquery");
var Mustache = require("mustache");
Mustache.parse(template);
var FileBrowser = require("../../../../../Abstract/file-browser");

function TakenRequest(){
  this.elem = jQuery("<div></div>");
}

TakenRequest.prototype.set = function(help){
  this._id = help._id;
  this.elem.append(jQuery(Mustache.render(template,help)));
  this.browser = new FileBrowser();
  this.elem.find(".file-browser").append(this.browser.elem);
  this.browser.loadSnapshot(help.snapshot);
};

TakenRequest.prototype.empty = function(){
  this.elem.empty();
  this._id = void 0;
};


module.exports = TakenRequest;
